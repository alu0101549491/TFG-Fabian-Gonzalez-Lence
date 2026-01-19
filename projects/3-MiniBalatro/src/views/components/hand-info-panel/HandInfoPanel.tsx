// ============================================
// FILE: src/views/components/hand-info-panel/HandInfoPanel.tsx
// ============================================

import React from 'react';
import { HandType } from '../../../models/poker/hand-type.enum';
import { HandUpgradeManager } from '../../../models/poker/hand-upgrade-manager';
import { getBaseHandValues } from '../../../models/poker/hand-type.enum';
import './HandInfoPanel.css';

/**
 * Interface for HandInfoPanel component props.
 */
interface HandInfoPanelProps {
  upgradeManager: HandUpgradeManager;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Panel displaying all poker hands with their levels and base values.
 * Shows upgrades from Planet cards.
 */
export const HandInfoPanel: React.FC<HandInfoPanelProps> = ({
  upgradeManager,
  isOpen,
  onClose
}) => {
  if (!isOpen) return null;

  /**
   * Gets display name for hand type.
   */
  const getHandName = (handType: HandType): string => {
    return handType.replace(/_/g, ' ');
  };

  /**
   * Gets the current level of a hand type.
   * Level = 1 + (upgrades applied)
   */
  const getHandLevel = (handType: HandType): number => {
    const upgrade = upgradeManager.getUpgradedValues(handType);
    // Simple level calculation: if any upgrades exist, increment level
    // In real Balatro, each Planet card increases level by 1
    if (upgrade.additionalChips > 0 || upgrade.additionalMult > 0) {
      // For now, estimate level based on upgrades
      // Each planet typically adds +10 chips and +1 mult
      return 1 + Math.max(
        Math.floor(upgrade.additionalChips / 10),
        upgrade.additionalMult
      );
    }
    return 1;
  };

  /**
   * Gets total chips for a hand (base + upgrades).
   */
  const getTotalChips = (handType: HandType): number => {
    const base = getBaseHandValues(handType);
    const upgrade = upgradeManager.getUpgradedValues(handType);
    return base.baseChips + upgrade.additionalChips;
  };

  /**
   * Gets total mult for a hand (base + upgrades).
   */
  const getTotalMult = (handType: HandType): number => {
    const base = getBaseHandValues(handType);
    const upgrade = upgradeManager.getUpgradedValues(handType);
    return base.baseMult + upgrade.additionalMult;
  };

  // Order hands from best to worst
  const handTypes = [
    HandType.STRAIGHT_FLUSH,
    HandType.FOUR_OF_A_KIND,
    HandType.FULL_HOUSE,
    HandType.FLUSH,
    HandType.STRAIGHT,
    HandType.THREE_OF_A_KIND,
    HandType.TWO_PAIR,
    HandType.PAIR,
    HandType.HIGH_CARD
  ];

  return (
    <>
      {/* Overlay background */}
      <div className="hand-info-overlay" onClick={onClose} />
      
      {/* Panel content */}
      <div className="hand-info-panel">
        <div className="hand-info-header">
          <h2>Poker Hands</h2>
          <button className="close-button" onClick={onClose}>✕</button>
        </div>

        <div className="hand-info-content">
          <div className="hand-info-grid">
            {handTypes.map(handType => {
              const level = getHandLevel(handType);
              const chips = getTotalChips(handType);
              const mult = getTotalMult(handType);
              const upgrade = upgradeManager.getUpgradedValues(handType);
              const hasUpgrade = upgrade.additionalChips > 0 || upgrade.additionalMult > 0;

              return (
                <div 
                  key={handType} 
                  className={`hand-info-row ${hasUpgrade ? 'upgraded' : ''}`}
                >
                  <div className="hand-info-name">
                    {getHandName(handType)}
                    {hasUpgrade && <span className="upgrade-indicator">★</span>}
                  </div>
                  <div className="hand-info-level">
                    Level {level}
                  </div>
                  <div className="hand-info-values">
                    <span className="chips-value">{chips} chips</span>
                    <span className="mult-value">×{mult} mult</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="hand-info-legend">
            <div className="legend-item">
              <span className="upgrade-indicator">★</span>
              <span>= Upgraded by Planet card</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
