<?php
/** Sidebar — outline icons (24 viewBox), stroke currentColor; active/hover tint from dashboard.css */
?>
<div class="sidebar-inner">
  <ul class="sidebar-menu" id="sidebarMenu">
    <li class="menu-item active" data-view="home" title="Dashboard">
      <span class="menu-icon-svg" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" points="9 22 9 12 15 12 15 22"/></svg>
      </span>
      <span class="menu-text">Dashboard</span>
    </li>

    <li class="menu-item" data-view="trading-account" title="Trading Account">
      <span class="menu-icon-svg" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="20" height="14" x="2" y="5" rx="2" stroke="currentColor" stroke-width="1.75"/><line x1="2" x2="22" y1="10" y2="10" stroke="currentColor" stroke-width="1.75"/></svg>
      </span>
      <span class="menu-text">Trading Account</span>
    </li>

    <li class="menu-item" data-view="deposit" title="Deposit">
      <span class="menu-icon-svg" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M12 5v14"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14"/></svg>
      </span>
      <span class="menu-text">Deposit</span>
    </li>

    <li class="menu-item" data-view="withdraw" title="Withdraw">
      <span class="menu-icon-svg" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
      </span>
      <span class="menu-text">Withdraw</span>
    </li>

    <li class="menu-item" data-view="verification" title="Verification">
      <span class="menu-icon-svg" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="m9 12 2 2 4-4"/></svg>
      </span>
      <span class="menu-text">Verification</span>
    </li>

    <li class="menu-item has-sub" data-group="analysis" title="Analysis">
      <div class="menu-main">
        <span class="menu-icon-svg" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M18 17V9"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M13 17V5"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M8 17v-3"/></svg>
        </span>
        <span class="menu-text">Analysis</span>
        <i class="bi bi-chevron-down caret-icon"></i>
      </div>
      <ul class="submenu">
        <li class="submenu-item" data-view="analysis-technical" title="Technical Analysis">
          <span class="submenu-line"></span>
          <span class="submenu-icon-svg" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="m18 9-6 6-4-4-3 3"/></svg>
          </span>
          <span class="submenu-text">Technical Analysis</span>
        </li>
        <li class="submenu-item" data-view="analysis-calendar" title="Economic Calendar">
          <span class="submenu-line"></span>
          <span class="submenu-icon-svg" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M8 2v4"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2" stroke="currentColor" stroke-width="1.75"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M3 10h18"/></svg>
          </span>
          <span class="submenu-text">Economic Calendar</span>
        </li>
        <li class="submenu-item" data-view="analysis-news" title="News">
          <span class="submenu-line"></span>
          <span class="submenu-icon-svg" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M18 14h-8"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M15 18h-5"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M10 6h8v4h-8z"/></svg>
          </span>
          <span class="submenu-text">News</span>
        </li>
      </ul>
    </li>

    <li class="menu-item" data-view="ai-setting" title="AI Settings">
      <span class="menu-icon-svg menu-icon-svg--wide" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2" stroke="currentColor" stroke-width="1.75"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M2 14h2"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M20 14h2"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M15 13v2"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M9 13v2"/></svg>
      </span>
      <span class="menu-text">AI Settings</span>
    </li>

    <li class="menu-item" data-view="web-trader" title="Web Trader">
      <span class="menu-icon-svg" aria-hidden="true">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="20" height="14" x="2" y="3" rx="2" stroke="currentColor" stroke-width="1.75"/><line x1="8" x2="16" y1="21" y2="21" stroke="currentColor" stroke-width="1.75"/><line x1="12" x2="12" y1="17" y2="21" stroke="currentColor" stroke-width="1.75"/></svg>
      </span>
      <span class="menu-text">Web Trader</span>
    </li>
  </ul>

  <div class="settings-block">
    <div class="menu-item has-sub settings-item" data-group="settings" title="Settings">
      <div class="menu-main">
        <span class="menu-icon-svg" aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><line x1="21" x2="14" y1="4" y2="4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="10" x2="3" y1="4" y2="4" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="21" x2="12" y1="12" y2="12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="8" x2="3" y1="12" y2="12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="21" x2="16" y1="20" y2="20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="12" x2="3" y1="20" y2="20" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="14" x2="14" y1="2" y2="6" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="8" x2="8" y1="10" y2="14" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/><line x1="16" x2="16" y1="18" y2="22" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
        </span>
        <span class="menu-text">Settings</span>
        <i class="bi bi-chevron-down caret-icon"></i>
      </div>
      <ul class="submenu">
        <li class="submenu-item" data-view="settings-profile" title="Profile">
          <span class="submenu-line"></span>
          <span class="submenu-icon-svg" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="1.75"/></svg>
          </span>
          <span class="submenu-text">Profile</span>
        </li>
        <li class="submenu-item" data-view="settings-questionnaire" title="Questionnaire">
          <span class="submenu-line"></span>
          <span class="submenu-icon-svg" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="8" height="4" x="8" y="2" rx="1" ry="1" stroke="currentColor" stroke-width="1.75"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M12 11h4"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M12 16h4"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M8 11h.01"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M8 16h.01"/></svg>
          </span>
          <span class="submenu-text">Questionnaire</span>
        </li>
      </ul>
    </div>
  </div>

  <button type="button" class="menu-item bare" data-view="support" title="Support">
    <span class="menu-icon-svg" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
    </span>
    <span class="menu-text">Support</span>
  </button>

  <button type="button" class="menu-item bare" data-view="help" title="Help">
    <span class="menu-icon-svg" aria-hidden="true">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.75"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M12 17h.01"/></svg>
    </span>
    <span class="menu-text">Help</span>
  </button>

  <button type="button" class="menu-item bare logout-row" title="Log out" onclick="window.location.href='/logout'">
    <span class="menu-icon-svg menu-icon-svg--logout" aria-hidden="true">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"/></svg>
    </span>
    <span class="menu-text">Log out</span>
  </button>

  <div class="sidebar-payment-strip" aria-label="Accepted payment methods">
    <span class="sidebar-payment-badge" title="Mastercard">
      <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <rect width="48" height="32" rx="3" fill="#fff"/>
        <circle cx="18" cy="16" r="10" fill="#EB001B"/>
        <circle cx="30" cy="16" r="10" fill="#F79E1B"/>
        <path d="M24 10c2.5 2 2.5 4.5 0 12.5-2.5-2-2.5-4.5 0-12.5z" fill="#FF5F00"/>
      </svg>
    </span>
    <span class="sidebar-payment-badge" title="Visa">
      <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <rect width="48" height="32" rx="3" fill="#1A1F71"/>
        <text x="24" y="21" text-anchor="middle" font-size="11" font-weight="900" fill="#fff" letter-spacing="0.06em" style="font-family: 'Space Grotesk', 'Poppins', system-ui, sans-serif;">VISA</text>
      </svg>
    </span>
    <span class="sidebar-payment-badge" title="OK Pay">
      <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <rect width="48" height="32" rx="3" fill="#EA580C"/>
        <text x="24" y="14" text-anchor="middle" font-size="7" font-weight="700" fill="#fff" style="font-family: 'Space Grotesk', 'Poppins', system-ui, sans-serif;">OK</text>
        <text x="24" y="23" text-anchor="middle" font-size="7" font-weight="700" fill="#fff" style="font-family: 'Space Grotesk', 'Poppins', system-ui, sans-serif;">PAY</text>
      </svg>
    </span>
    <span class="sidebar-payment-badge" title="Wire transfer">
      <svg viewBox="0 0 48 32" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
        <rect width="48" height="32" rx="3" fill="#f8fafc" stroke="#bae6fd"/>
        <path stroke="#22c55e" stroke-width="1.4" stroke-linecap="round" fill="none" d="M5 11h5M5 14h7M5 17h5"/>
        <text x="26" y="20" text-anchor="middle" font-size="7" font-weight="700" fill="#0369a1" style="font-family: 'Space Grotesk', 'Poppins', system-ui, sans-serif;">WIRE</text>
        <text x="26" y="27" text-anchor="middle" font-size="5" font-weight="600" fill="#64748b" style="font-family: 'Space Grotesk', 'Poppins', system-ui, sans-serif;">TRANSFER</text>
      </svg>
    </span>
  </div>
</div>
