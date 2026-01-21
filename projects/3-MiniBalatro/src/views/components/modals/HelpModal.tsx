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
            <div className="help-list">
              <div className="help-item">
                <strong>High Card:</strong> Single card (Lowest)
              </div>
              <div className="help-item">
                <strong>Pair:</strong> Two cards of same rank
              </div>
              <div className="help-item">
                <strong>Two Pair:</strong> Two different pairs
              </div>
              <div className="help-item">
                <strong>Three of a Kind:</strong> Three cards of same rank
              </div>
              <div className="help-item">
                <strong>Straight:</strong> Five cards in sequence
              </div>
              <div className="help-item">
                <strong>Flush:</strong> Five cards of same suit
              </div>
              <div className="help-item">
                <strong>Full House:</strong> Three of a kind + Pair
              </div>
              <div className="help-item">
                <strong>Four of a Kind:</strong> Four cards of same rank
              </div>
              <div className="help-item">
                <strong>Straight Flush:</strong> Straight with same suit
              </div>
              <div className="help-item">
                <strong>Royal Flush:</strong> 10-J-Q-K-A of same suit (Highest)
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
              Special cards that boost your score permanently. You can hold up to 5 jokers.
            </p>
            <div className="help-examples">
              <div className="help-example">
                <strong>Greedy Joker:</strong> Adds chips when you play Diamond cards
              </div>
              <div className="help-example">
                <strong>Blue Joker:</strong> Adds chips based on remaining deck size
              </div>
              <div className="help-example">
                <strong>Hiker:</strong> Permanently upgrades cards each time you play them
              </div>
            </div>
          </section>

          {/* Tarots */}
          <section className="help-section">
            <h2 className="help-section-title">🌟 Tarot Cards</h2>
            <p>
              Single-use consumables that modify your cards or game state. You can hold up to 2 tarots.
            </p>
            <div className="help-examples">
              <div className="help-example">
                <strong>The Empress:</strong> Adds permanent bonus chips to a card
              </div>
              <div className="help-example">
                <strong>Death:</strong> Converts a card to a random new card
              </div>
              <div className="help-example">
                <strong>The Hermit:</strong> Doubles your current money
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
