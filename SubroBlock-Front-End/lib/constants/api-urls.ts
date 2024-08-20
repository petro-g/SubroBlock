// constants for urls
// easy to find or change urls
// client doesn't know backend address, so uses Node.js env as proxy. client -> Node.js -> backend

// # auth
export const URL_LOGIN = process.env.API_URL + "/login";

export const URL_TOKEN_REFRESH = process.env.API_URL + "/token/refresh";

// # end-auth

const PUBLIC_API_URL = process.env.NEXT_PUBLIC_URL + "/api";

// # password recovery/reset
export const URL_FORGOT_PASSWORD_INITIATE_RECOVERY =
  PUBLIC_API_URL + "/forgot-password/initiate-recovery";

export const URL_FORGOT_PASSWORD_VALIDATE_TOKEN =
  PUBLIC_API_URL + "/forgot-password/validate-token";

export const URL_FORGOT_PASSWORD_NEW_PASSWORD =
  PUBLIC_API_URL + "/forgot-password/new-password"; // FIXME route DOESN'T EXIST

export const URL_UPDATE_ROOT_USER_PASSWORD =
  PUBLIC_API_URL + "/root-user/password";

// # end-password recovery/reset

// # users
export const URL_ROOT_GET_USERS =
  PUBLIC_API_URL + "/root-user/users";

export const URL_ROOT_CREATE_USER = URL_ROOT_GET_USERS;

export const URL_ADMIN_CREATE_USER =
  PUBLIC_API_URL + "/organization/user";
// TODO ask backend to rename to /admin-user/users, to be consistent
export const URL_ADMIN_CREATE_ARBITRATOR_USER =
  PUBLIC_API_URL + "/admin-user/arb-users";

export const URL_ADMIN_GET_USERS =
  PUBLIC_API_URL + "/admin-user/users";

export const URL_TEMPLATE_ADMIN_SUSPEND_USER = (userId: number) =>
  PUBLIC_API_URL + `/admin-user/users/${userId}/status`;

export const URL_TEMPLATE_ROOT_SUSPEND_USER = (userId: number) =>
  PUBLIC_API_URL + `/root-user/users/${userId}/status`;

export const URL_TEMPLATE_ROOT_GET_USER = (userId: number) =>
  PUBLIC_API_URL + `/root-user/users/${userId}`;

export const URL_TEMPLATE_ADMIN_GET_USER = (userId: number) =>
  PUBLIC_API_URL + `/admin-user/users/${userId}`;

export const URL_GET_CURRENT_USER_ACTIVITY_COUNT =
  PUBLIC_API_URL + "/business-user/activity/count";

export const URL_ADMIN_GET_ARBITRATORS =
  PUBLIC_API_URL + "/admin-user/arb-users";

// # end-users

// # organizations
export const URL_GET_ORGANIZATIONS =
  PUBLIC_API_URL + "/organization";

export const URL_CREATE_ORGANIZATIONS =
  PUBLIC_API_URL + "/organization/create";

export const URL_TEMPLATE_ORGANIZATIONS_SET_STATUS = (organizationId: number) =>
  PUBLIC_API_URL + `/organization/${organizationId}/status`;

export const URL_ORGANIZATIONS_UPDATE_ROOT_USER_PASSWORD =
  PUBLIC_API_URL + "/organization/update-root-user-password";

// # end-organizations

// # offers
export const URL_GET_OFFERS =
  PUBLIC_API_URL + "/business-user/offers/sent";

export const URL_GET_ARBITRATION_OFFERS =
  PUBLIC_API_URL + "/arb-user/offers/arbitration-queue";
export const URL_GET_ARBITRATION_HISTORY_OFFERS =
  PUBLIC_API_URL + "/arb-user/offers/history";

export const URL_GET_OFFERS_HISTORY =
  PUBLIC_API_URL + "/business-user/offers/history/sent";

export const URL_GET_RECEIVED_OFFERS_HISTORY =
  PUBLIC_API_URL + "/business-user/offers/history/received";

export const URL_POST_OFFERS =
  PUBLIC_API_URL + "/business-user/offers/create";

export const URL_TEMPLATE_POST_RECEIVED_OFFERS = (offerId: number) =>
  process.env.NEXT_PUBLIC_URL +
  `/api/business-user/offers/${offerId}/response`;

export const URL_GET_RECEIVED_OFFERS =
  PUBLIC_API_URL + "/business-user/offers/received";

export const URL_GET_ADMIN_OFFERS =
  PUBLIC_API_URL + "/admin-user/offers";

export const URL_TEMPLATE_ADMIN_CANCEL_OFFER = (offerId: number) =>
  PUBLIC_API_URL + `/admin-user/offers/${offerId}/cancel`;

export const URL_TEMPLATE_SIGN_OFFER = (offerId: number) =>
  PUBLIC_API_URL + `/business-user/offers/${offerId}/sign`;

export const URL_TEMPLATE_SIGN_OFFER_RESPONSE = (responseId: number) =>
  PUBLIC_API_URL + `/business-user/offers/response/${responseId}/sign`;

// # end-offers

// # transactions
export const URL_ADMIN_CREATE_COINS =
  PUBLIC_API_URL + "/admin-user/transactions/mint";

export const URL_ADMIN_MOVE_COINS =
  PUBLIC_API_URL + "/admin-user/transactions/move";

export const URL_ADMIN_GET_TRANSACTIONS =
  PUBLIC_API_URL + "/admin-user/transactions";

export const URL_ROOT_GET_TRANSACTIONS =
  PUBLIC_API_URL + "/root-user/transactions";

// # end-transactions

// # wallet
export const URL_ADMIN_GET_WALLETS =
  PUBLIC_API_URL + "/admin-user/wallets";

export const URL_ROOT_GET_WALLET_BALANCE =
  PUBLIC_API_URL + "/root-user/wallet/balance";

export const URL_ROOT_BUY_WALLET_BALANCE =
  PUBLIC_API_URL + "/root-user/wallet/buy";

export const URL_ROOT_SELL_WALLET_BALANCE =
  PUBLIC_API_URL + "/root-user/wallet/sell";

export const URL_ROOT_GET_WALLET_ANALYTICS =
  PUBLIC_API_URL + "/root-user/wallet/analytics/pl";
// P&L meaning Profit and Loss
// # end-wallet

// # actions log
export const URL_TEMPLATE_ROOT_GET_ACTIONS_LOG = (userId: number) =>
  PUBLIC_API_URL + `/root-user/users/${userId}/actions-log`;

export const URL_TEMPLATE_ADMIN_GET_ACTIONS_LOG = (userId: number) =>
  process.env.NEXT_PUBLIC_URL +
  `/api/admin-user/users/${userId}/actions-log`;

// # end-actions log

// # keys
export const URL_ROOT_GET_KEYS = PUBLIC_API_URL + "/root-user/keys"
export const URL_ROOT_GENERATE_KEY = PUBLIC_API_URL + "/root-user/keys/generate"
export const URL_ROOT_ASSIGN_KEY = PUBLIC_API_URL + "/root-user/keys/assign"
export const URL_TEMPLATE_ROOT_DELETE_KEY = (keyId: number) => PUBLIC_API_URL + `/root-user/keys/${keyId}`
export const URL_TEMPLATE_ROOT_RENEW_KEY = (keyId: number) => PUBLIC_API_URL + `/root-user/keys/${keyId}/renew`
// # end-keys

// # s3 files
export const URL_TEMPLATE_GET_OFFER_FILES = (offerId: number) =>
  PUBLIC_API_URL + `/offers/${offerId}/attachments`;

export const URL_POST_COMPLETE_SMALL_FILE_UPLOAD = PUBLIC_API_URL + "/offers/attachments";

export const URL_TEMPLATE_DELETE_OFFER_FILE = (fileId: string) =>
  PUBLIC_API_URL + `/offers/${fileId}/attachments`;

export const URL_GET_FILE_SIGNED_URL = // for upload all and download small files
  PUBLIC_API_URL + "/files/signed-url";

export const URL_GET_BIG_FILE_UPLOAD_SIGNED_URL =
  PUBLIC_API_URL + "/files/signed-url/upload-part";

export const URL_POST_INITIATE_BIG_FILE_UPLOAD =
  PUBLIC_API_URL + "/files/signed-url/initiate-multipart";

export const URL_POST_COMPLETE_BIG_FILE_UPLOAD =
  PUBLIC_API_URL + "/files/signed-url/complete-multipart";

// # end-s3 files
