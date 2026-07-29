<?php
return [
  // PrimeCRM base (no trailing slash)
  'BASE_URL' => 'https://c20900-backend-clientzone.primecrm.io/api/v1',

  // Keep null. You’re using per-login tokens, not a static token.
  'STATIC_BEARER' => null,

  /** Sent as userDevice.appVersion in auth/login payload. */
  'WEB_APP_VERSION' => '3.0.25',

  /** Default department for Support tickets (UUID from CRM). */
  'SUPPORT_DEFAULT_DEPARTMENT_ID' => '01cbe2c0-0e16-45e7-8f2b-e7e4e2836aaf',

  /**
   * GET path to list current user’s tickets (session Bearer).
   * Change if your backend uses a different route.
   */
  'TICKETS_LIST_PATH' => 'clientzone/lead/ticket/user',
];
