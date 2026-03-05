import { gsap } from "gsap";
import { CardData } from "../../local-server/CardDatabase";
import { Card } from "./Card";
import { CardContainer } from "./CardContainer";

/**
 * Handles card animations for transfers and placements
 */
export class CardAnimator {
	private activeTransfers: Map<CardContainer, Set<GSAPTween>> = new Map();

	/**
	 * Get or create the active transfers set for a container
	 */
	private getActiveTransfers(container: CardContainer): Set<GSAPTween> {
		if (!this.activeTransfers.has(container)) {
			this.activeTransfers.set(container, new Set());
		}
		return this.activeTransfers.get(container)!;
	}

	/**
	 * Add multiple cards with animation from a specific global position.
	 * All final positions are pre-calculated so every card lands in the correct spot.
	 * @param container Container to add cards to
	 * @param cardDataArray Card data items to add
	 * @param fromGlobalPosition Starting position for each card's animation (global coordinates)
	 * @param animationDuration Duration of the animation in seconds
	 */
	public addCardsWithAnimation(
		container: CardContainer,
		cardDataArray: CardData[],
		fromGlobalPosition: { x: number; y: number },
		animationDuration: number = 0.5
	): GSAPTimeline {
		const existingCount = container.cards.length;
		const totalCount = existingCount + cardDataArray.length;

		let cardWidth = 100;
		let firstNewCard: Card | null = null;

		if (container.cards.length > 0) {
			cardWidth = container.cards[0].width;
		} else if (cardDataArray.length > 0) {
			firstNewCard = new Card(cardDataArray[0]);
			cardWidth = firstNewCard.width * container.cardScale;
		}

		const allPositions = this.computeLayout(totalCount, cardWidth, container);
		const localStart = container.toLocal(fromGlobalPosition);

		const newCards: Card[] = cardDataArray.map((data, i) => {
			const card = i === 0 && firstNewCard ? firstNewCard : new Card(data);

			container.cards.push(card);
			container.addChild(card);
			card.position.set(localStart.x, localStart.y);
			card.scale.set(container.cardScale * 0.9);
			card.eventMode = container.areCardsInteractive ? "static" : "none";
			card.cursor = container.areCardsInteractive ? "pointer" : "default";
			container.emit("cardAdded", { card, container });

			return card;
		});

		const timeline = gsap.timeline();

		container.cards.slice(0, existingCount).forEach((card, index) => {
			const { x, y } = allPositions[index];

			if (Math.abs(card.x - x) > 1 || Math.abs(card.y - y) > 1) {
				timeline.to(
					card,
					{ x, y, duration: animationDuration, ease: "power2.out" },
					"<+0.1"
				);
				timeline.to(
					card.scale,
					{
						x: container.cardScale,
						y: container.cardScale,
						duration: animationDuration,
						ease: "power2.out",
					},
					"<"
				);
			} else {
				card.position.set(x, y);
				card.scale.set(container.cardScale);
			}
		});

		// Animate new cards staggered.
		newCards.forEach((card, newIndex) => {
			const { x, y } = allPositions[existingCount + newIndex];

			timeline.to(
				card,
				{ x, y, duration: animationDuration, ease: "power2.out" },
				"<+=0.03"
			);
			timeline.to(
				card.scale,
				{
					x: container.cardScale,
					y: container.cardScale,
					duration: animationDuration,
					ease: "power2.out",
				},
				"<"
			);
		});

		return timeline;
	}

	/**
	 * Transfer a card from source to target container with animation
	 * @param card Card to transfer
	 * @param sourceContainer Source container
	 * @param targetContainer Target container
	 */
	public async transferCard(
		card: Card,
		sourceContainer: CardContainer,
		targetContainer: CardContainer
	): Promise<void> {
		const cardIndex = sourceContainer.cards.indexOf(card);

		if (cardIndex < 0 || cardIndex >= sourceContainer.cards.length) {
			throw new Error(
				"Card not found in this container " + sourceContainer.label
			);
		}

		const cardToTransfer = sourceContainer.cards[cardIndex];
		const sourceScale = sourceContainer.scale.x;
		const targetScale = targetContainer.scale.x;

		const sourceCardScale = sourceContainer.cardScale;
		const targetCardScale = targetContainer.cardScale;

		const targetCardIndex = targetContainer.cards.length;
		const targetFinalPos = this.calculateCardPosition(
			sourceContainer,
			targetContainer,
			targetCardIndex
		);

		const targetFinalGlobal = targetContainer.toGlobal(targetFinalPos);

		const targetLocalInSource = sourceContainer.toLocal(targetFinalGlobal);

		sourceContainer.cards.splice(cardIndex, 1);

		if (cardToTransfer.showingBack) {
			cardToTransfer.showFront();
		}

		cardToTransfer.eventMode = "none";
		cardToTransfer.cursor = "default";

		sourceContainer.emit("cardRemoved", {
			card: cardToTransfer,
			container: sourceContainer,
		});

		return new Promise<void>((resolve) => {
			const targetVisualScale =
				(targetCardScale * targetScale) / (sourceCardScale * sourceScale);

			const tweenDuration = 0.4;

			const positionTween = gsap.to(cardToTransfer, {
				x: targetLocalInSource.x,
				y: targetLocalInSource.y,
				duration: tweenDuration,
				ease: "power2.inOut",
			});

			const scaleTween = gsap.to(cardToTransfer.scale, {
				x: targetVisualScale * sourceCardScale,
				y: targetVisualScale * sourceCardScale,
				duration: tweenDuration,
				ease: "power2.inOut",
				onComplete: () => {
					sourceContainer.removeChild(cardToTransfer);

					const finalCardIndex = targetContainer.cards.length;
					const finalPos = this.calculateCardPosition(
						sourceContainer,
						targetContainer,
						finalCardIndex
					);

					cardToTransfer.x = finalPos.x;
					cardToTransfer.y = finalPos.y;
					cardToTransfer.scale.set(targetCardScale);

					targetContainer.cards.push(cardToTransfer);
					targetContainer.addChild(cardToTransfer);

					cardToTransfer.eventMode = targetContainer.areCardsInteractive
						? "static"
						: "none";
					cardToTransfer.cursor = targetContainer.areCardsInteractive
						? "pointer"
						: "default";

					targetContainer.emit("cardAdded", {
						card: cardToTransfer,
						container: targetContainer,
					});

					const sourceTransfers = this.getActiveTransfers(sourceContainer);
					const targetTransfers = this.getActiveTransfers(targetContainer);

					sourceTransfers.delete(positionTween);
					sourceTransfers.delete(scaleTween);
					targetTransfers.delete(positionTween);
					targetTransfers.delete(scaleTween);

					if (sourceTransfers.size === 0) {
						sourceContainer["updateCardPositions"]();
					}

					if (targetTransfers.size === 0) {
						targetContainer["updateCardPositions"]();
					}
					resolve();
				},
			});

			const sourceTransfers = this.getActiveTransfers(sourceContainer);
			const targetTransfers = this.getActiveTransfers(targetContainer);

			sourceTransfers.add(positionTween);
			sourceTransfers.add(scaleTween);

			targetTransfers.add(positionTween);
			targetTransfers.add(scaleTween);
		});
	}

	/**
	 * Calculate the position for a card in the container based on index,
	 * taking into account maxWidth and spacing/overlap.
	 * @param sourceContainer Source container (for getting card width if target is empty)
	 * @param targetContainer Target container
	 * @param cardIndex Card index to calculate position for
	 * @returns Position {x, y} for the card
	 */
	private calculateCardPosition(
		sourceContainer: CardContainer,
		targetContainer: CardContainer,
		cardIndex: number
	): { x: number; y: number } {
		let cardWidth = 100;

		if (targetContainer.cards.length > 0) {
			cardWidth = targetContainer.cards[0].width;
		} else if (sourceContainer.cards.length > 0) {
			cardWidth =
				(sourceContainer.cards[0].width / sourceContainer.cardScale) *
				targetContainer.cardScale;
		}

		const totalCards = targetContainer.cards.length + 1; // +1 for the card being added

		return this.computeLayout(totalCards, cardWidth, targetContainer)[
			cardIndex
		];
	}

	/**
	 * Compute all card positions for a given total card count in a container.
	 * @param totalCards Total number of cards after placement
	 * @param cardWidth Width of a single card
	 * @param container Target container (used for maxWidth and cardSpacing)
	 */
	private computeLayout(
		totalCards: number,
		cardWidth: number,
		container: CardContainer
	): { x: number; y: number }[] {
		const totalWidthNeeded =
			totalCards * cardWidth + (totalCards - 1) * container.cardSpacing;

		let actualSpacing = container.cardSpacing;
		let overlap = 0;

		if (totalWidthNeeded > container.maxWidth) {
			const availableSpaceForSpacing =
				container.maxWidth - totalCards * cardWidth;

			if (availableSpaceForSpacing >= 0) {
				actualSpacing = availableSpaceForSpacing / (totalCards - 1);
			} else {
				actualSpacing = 0;
				overlap = Math.abs(availableSpaceForSpacing) / (totalCards - 1);
			}
		}

		const totalWidth =
			overlap > 0
				? container.maxWidth
				: totalCards * cardWidth + (totalCards - 1) * actualSpacing;

		const startX = -totalWidth / 2 + cardWidth / 2;

		return Array.from({ length: totalCards }, (_, i) => ({
			x:
				overlap > 0
					? startX + i * (cardWidth - overlap)
					: startX + i * (cardWidth + actualSpacing),
			y: 0,
		}));
	}
}
