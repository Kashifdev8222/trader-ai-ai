<!-- AI onboarding wizard — completion stored server-side (JSON); skip uses session until logout -->
<div id="cpAiOnboardOverlay" class="cp-ai-onboard" hidden aria-hidden="true">
  <div class="cp-ai-onboard__dialog" role="dialog" aria-modal="true" aria-labelledby="cpAiOnboardHdrTitle">
    <div class="cp-ai-onboard__header">
      <div class="cp-ai-onboard__header-bar">
        <div class="cp-ai-onboard__header-actions">
          <button type="button" class="cp-ai-onboard__skip" id="cpAiOnboardSkip">Not now</button>
          <button type="button" class="cp-ai-onboard__close" id="cpAiOnboardClose" aria-label="Close">
            <i class="bi bi-x-lg" aria-hidden="true"></i>
          </button>
        </div>
      </div>
      <div class="cp-ai-onboard__progress">
        <div class="cp-ai-onboard__progress-fill" id="cpAiOnboardProgressFill"></div>
      </div>
      <div class="cp-ai-onboard__step-indicator">
        <span id="cpAiOnboardStepNum">Step 1 of 4</span>
        <span id="cpAiOnboardStepName">Select Trading Type</span>
      </div>
      <h2 class="cp-ai-onboard__title" id="cpAiOnboardHdrTitle">Configure Your AI Trader</h2>
      <p class="cp-ai-onboard__subtitle" id="cpAiOnboardHdrDesc">Let's set up your AI trading preferences for optimal results.</p>
    </div>

    <div class="cp-ai-onboard__body">
      <div class="cp-ai-onboard__step cp-ai-onboard__step--active" id="cpAiOnboardStep1" data-cp-onboard-step="1">
        <div class="cp-ai-onboard__step-title">Which markets interest you?</div>
        <p class="cp-ai-onboard__step-desc">Choose the market you want reflected in your AI setup request.</p>
        <div class="cp-ai-onboard__markets">
          <div class="cp-ai-onboard__market">
            <input type="radio" id="cpOnboardMarketForex" name="cpOnboardMarket" value="forex" checked>
            <label for="cpOnboardMarketForex" class="cp-ai-onboard__market-label">📈 Forex</label>
          </div>
          <div class="cp-ai-onboard__market">
            <input type="radio" id="cpOnboardMarketCrypto" name="cpOnboardMarket" value="crypto">
            <label for="cpOnboardMarketCrypto" class="cp-ai-onboard__market-label">₿ Crypto</label>
          </div>
          <div class="cp-ai-onboard__market">
            <input type="radio" id="cpOnboardMarketCommodities" name="cpOnboardMarket" value="commodities">
            <label for="cpOnboardMarketCommodities" class="cp-ai-onboard__market-label">⚡ Commodities</label>
          </div>
          <div class="cp-ai-onboard__market">
            <input type="radio" id="cpOnboardMarketStocks" name="cpOnboardMarket" value="stocks">
            <label for="cpOnboardMarketStocks" class="cp-ai-onboard__market-label">📊 Stock</label>
          </div>
          <div class="cp-ai-onboard__market">
            <input type="radio" id="cpOnboardMarketIndices" name="cpOnboardMarket" value="indices">
            <label for="cpOnboardMarketIndices" class="cp-ai-onboard__market-label">📉 Indices</label>
          </div>
        </div>
      </div>

      <div class="cp-ai-onboard__step" id="cpAiOnboardStep2" data-cp-onboard-step="2">
        <div class="cp-ai-onboard__step-title">Trading account &amp; investment amount</div>
        <p class="cp-ai-onboard__step-desc">Pick the TP (trading account) to use for balance and your ticket. The investment slider is capped by that account’s balance.</p>
        <div class="cp-ai-onboard__tp-field">
          <label class="cp-ai-onboard__lbl" for="cpAiOnboardTp">Trading account (TP)</label>
          <select id="cpAiOnboardTp" class="form-select cp-ai-onboard__select" autocomplete="off"></select>
        </div>
        <div class="cp-ai-onboard__range-block">
          <div class="cp-ai-onboard__range-label-row">
            <span class="cp-ai-onboard__range-label">Investment Amount</span>
            <span class="cp-ai-onboard__range-value" id="cpAiOnboardRangeVal">$0.00</span>
          </div>
          <input type="range" class="cp-ai-onboard__range" id="cpAiOnboardRange" min="0" max="0" step="1" value="0" />
          <div class="cp-ai-onboard__range-scale">
            <span id="cpAiOnboardRangeMin">$0</span>
            <span id="cpAiOnboardRangeMax">$0</span>
          </div>
        </div>
      </div>

      <div class="cp-ai-onboard__step" id="cpAiOnboardStep3" data-cp-onboard-step="3">
        <div class="cp-ai-onboard__step-title">Choose your risk preference</div>
        <p class="cp-ai-onboard__step-desc">Higher risk can mean higher returns but also larger potential losses.</p>
        <div class="cp-ai-onboard__risks">
          <div class="cp-ai-onboard__risk">
            <input type="radio" id="cpOnboardRiskLow" name="cpOnboardRisk" value="low" checked>
            <label for="cpOnboardRiskLow" class="cp-ai-onboard__risk-label">
              <span class="cp-ai-onboard__risk-icon" aria-hidden="true">🛡️</span>
              <span class="cp-ai-onboard__risk-name">Low</span>
            </label>
          </div>
          <div class="cp-ai-onboard__risk">
            <input type="radio" id="cpOnboardRiskMed" name="cpOnboardRisk" value="medium">
            <label for="cpOnboardRiskMed" class="cp-ai-onboard__risk-label">
              <span class="cp-ai-onboard__risk-icon" aria-hidden="true">⚖️</span>
              <span class="cp-ai-onboard__risk-name">Medium</span>
            </label>
          </div>
          <div class="cp-ai-onboard__risk">
            <input type="radio" id="cpOnboardRiskHigh" name="cpOnboardRisk" value="high">
            <label for="cpOnboardRiskHigh" class="cp-ai-onboard__risk-label">
              <span class="cp-ai-onboard__risk-icon" aria-hidden="true">🚀</span>
              <span class="cp-ai-onboard__risk-name">High</span>
            </label>
          </div>
        </div>
      </div>

      <div class="cp-ai-onboard__step" id="cpAiOnboardStep4" data-cp-onboard-step="4">
        <div class="cp-ai-onboard__step-title">Review Your Settings</div>
        <p class="cp-ai-onboard__step-desc">Confirm your choices. We will create a support ticket with these details, same as AI Settings.</p>
        <div class="cp-ai-onboard__summary">
          <div class="cp-ai-onboard__summary-row">
            <span class="cp-ai-onboard__summary-k">Trading Market</span>
            <span class="cp-ai-onboard__summary-v" id="cpAiOnboardSumMarket">Forex</span>
          </div>
          <div class="cp-ai-onboard__summary-row">
            <span class="cp-ai-onboard__summary-k">Trading account (TP)</span>
            <span class="cp-ai-onboard__summary-v" id="cpAiOnboardSumTp">—</span>
          </div>
          <div class="cp-ai-onboard__summary-row">
            <span class="cp-ai-onboard__summary-k">Investment Amount</span>
            <span class="cp-ai-onboard__summary-v" id="cpAiOnboardSumAmount">$0.00</span>
          </div>
          <div class="cp-ai-onboard__summary-row">
            <span class="cp-ai-onboard__summary-k">Risk Level</span>
            <span class="cp-ai-onboard__summary-v" id="cpAiOnboardSumRisk">Low</span>
          </div>
        </div>
        <div class="cp-ai-onboard__profit">
          <div class="cp-ai-onboard__profit-label">Potential Monthly Profit</div>
          <div class="cp-ai-onboard__profit-value" id="cpAiOnboardProfitLine">upto 5%($0.00) with Low Risk</div>
          <div class="cp-ai-onboard__profit-meta" id="cpAiOnboardProfitMeta"></div>
        </div>
        <div class="cp-ai-onboard__live-block">
          <label class="cp-ai-onboard__live-option" id="cpAiOnboardLiveWrap">
            <span class="cp-ai-onboard__live-circle" aria-hidden="true">
              <span class="cp-ai-onboard__live-dot"></span>
            </span>
            <span class="cp-ai-onboard__live-text">Make 20% + potentially on live events let us know and we will contact you</span>
            <input type="radio" name="cp_onboard_live" value="yes" class="cp-ai-onboard__live-native" tabindex="-1" />
          </label>
        </div>
        <div class="cp-ai-onboard__consent">
          <label class="cp-ai-onboard__consent-row">
            <input type="checkbox" id="cpAiOnboardConsent" class="cp-ai-onboard__consent-input" />
            <span class="cp-ai-onboard__consent-copy">
              <span class="cp-ai-onboard__consent-title">I agree to the Terms &amp; Conditions</span>
              <span class="cp-ai-onboard__consent-small">I understand that AI trading involves substantial risk of loss and past performance does not guarantee future results.</span>
            </span>
          </label>
        </div>
      </div>

      <p class="cp-ai-onboard__msg" id="cpAiOnboardMsg" role="status" aria-live="polite"></p>

      <div class="cp-ai-onboard__actions">
        <button type="button" class="cp-ai-onboard__btn cp-ai-onboard__btn--secondary" id="cpAiOnboardBack" hidden>Back</button>
        <button type="button" class="cp-ai-onboard__btn cp-ai-onboard__btn--primary" id="cpAiOnboardNext">Next</button>
      </div>
    </div>
  </div>
</div>
