// ============================================
// FILE: src/views/components/modals/HelpModal.tsx
// ============================================

import React from 'react';
import './HelpModal.css';

/**
 * Props for HelpModal component.
 */
interface HelpModalProps {
  /** Callback when user closes the modal */
  onClose: () => void;
}

/**
 * Modal displayed when player clicks Help button in main menu.
 * Shows useful information about game mechanics for new players.
 */
export const HelpModal: React.FC<HelpModalProps> = ({ onClose }) => {
  return (
    <div className="help-modal-overlay" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-modal-header">
          <h1 className="help-modal-title">How to Play Mini Balatro</h1>
          <button className="help-modal-close" onClick={onClose}>✖</button>
        </div>

        <div className="help-modal-content">
          {/* Game Objective */}
          <section className="help-section">
            <h2 className="help-section-title">🎯 Game Objective</h2>
            <p>
              Defeat 8 levels (3 blinds each) by scoring enough points with poker hands. 
              Each blind has a score goal you must reach within a limited number of hands.
            </p>
          </section>

          {/* Poker Hands */}
          <section className="help-section">
            <h2 className="help-section-title">🃏 Poker Hands</h2>
            <p className="help-note">
              Listed from <strong>best to worst</strong>. All hands can be upgraded with 🪐 <strong>Planet cards</strong> to increase their base chips and multiplier, making even weak hands powerful!
            </p>
            <div className="help-list">
              <div className="help-item help-item-best">
                <strong>Straight Flush:</strong> Five cards in sequence, all same suit (Best!)
              </div>
              <div className="help-item">
                <strong>Four of a Kind:</strong> Four cards of same rank
              </div>
              <div className="help-item">
                <strong>Full House:</strong> Three of a kind + Pair
              </div>
              <div className="help-item">
                <strong>Flush:</strong> Five cards of same suit
              </div>
              <div className="help-item">
                <strong>Straight:</strong> Five cards in sequence
              </div>
              <div className="help-item">
                <strong>Three of a Kind:</strong> Three cards of same rank
              </div>
              <div className="help-item">
                <strong>Two Pair:</strong> Two different pairs
              </div>
              <div className="help-item">
                <strong>Pair:</strong> Two cards of same rank
              </div>
              <div className="help-item help-item-worst">
                <strong>High Card:</strong> No matching cards (Weakest)
              </div>
            </div>
          </section>

          {/* Scoring */}
          <section className="help-section">
            <h2 className="help-section-title">📊 Scoring</h2>
            <p>
              Score = <strong>(Card Chips + Hand Chips) × (Hand Mult)</strong>
            </p>
            <p className="help-note">
              Each card has base chips (Ace=11, King=10, etc.). Hand types have bonus chips and mult.
            </p>
          </section>

          {/* Jokers */}
          <section className="help-section">
            <h2 className="help-section-title">🃏 Jokers</h2>
            <p>
              Special cards that boost your score permanently. You can hold up to 5 jokers. These are some examples of Joker Cards you can find:
            </p>
            <div className="help-examples">
              <div className="help-example">
                <strong>Joker:</strong> Adds +4 mult for the played hand
              </div>
              <div className="help-example">
                <strong>Odd Todd:</strong> Adds +31 chips per odd value card (A,3,5,7,9) played
              </div>
              <div className="help-example">
                <strong>Triboulet:</strong> Each K or Q played multiplies total mult by ×2
              </div>
            </div>
          </section>

          {/* Tarots */}
          <section className="help-section">
            <h2 className="help-section-title">🌟 Tarot Cards</h2>
            <p>
              Single-use consumables that modify your cards or game state. You can hold up to 2 tarots. These are some examples of Tarot Cards you can find:
            </p>
            <div className="help-examples">
              <div className="help-example">
                <strong>The Empress:</strong> Adds permanent bonus mult to a card
              </div>
              <div className="help-example">
                <strong>Death:</strong> Duplicates a selected card in your hand
              </div>
              <div className="help-example">
                <strong>The Hermit:</strong> Doubles your current money (max +$20)
              </div>
            </div>
          </section>

          {/* Blinds */}
          <section className="help-section">
            <h2 className="help-section-title">👁️ Blinds</h2>
            <p>
              Each level has 3 blinds: <strong>Small Blind</strong>, <strong>Big Blind</strong>, and <strong>Boss Blind</strong>.
            </p>
            <p className="help-note">
              Boss blinds have special rules that make them harder (e.g., The Mouth only allows one hand type per round).
            </p>
          </section>

          {/* Shop */}
          <section className="help-section">
            <h2 className="help-section-title">💰 Shop</h2>
            <p>
              After each blind, visit the shop to buy jokers, tarots, and card upgrades with your money. 
              Spend wisely to build a strong deck!
            </p>
          </section>

          {/* Tips */}
          <section className="help-section">
            <h2 className="help-section-title">💡 Pro Tips</h2>
            <ul className="help-tips">
              <li>Discard cards you don't need to draw better hands</li>
              <li>Build synergies between jokers (e.g., multiple Diamond-focused jokers)</li>
              <li>Save money for powerful jokers in later shops</li>
              <li>Use tarots strategically to upgrade your best cards</li>
              <li>The tarot cards only can be activated on the middle of a level</li>
              <li>Pay attention to boss blind mechanics!</li>
            </ul>
          </section>
        </div>

        <div className="help-modal-footer">
          <button className="help-modal-btn" onClick={onClose}>
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
};
