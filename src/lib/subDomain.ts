/**
 * Subscription domain helpers.
 *
 * New users  → SUB_DOMAIN_NEW  (atlassecure.ru)
 * Old users  → SUB_DOMAIN_OLD  (atlassecure.uk)
 *
 * The per-user domain is stored in `subscriptions.sub_domain`.
 * NULL means the user was created before the migration → old domain.
 */

const NEW_DOMAIN = process.env.SUB_DOMAIN_NEW ?? "https://atlassecure.ru";
const OLD_DOMAIN = process.env.SUB_DOMAIN_OLD ?? "https://atlassecure.uk";

/** Domain to assign when creating a brand-new subscription. */
export const DEFAULT_SUB_DOMAIN = NEW_DOMAIN;

/** Resolve the base URL for a user from their stored sub_domain value. */
export function resolveSubDomain(storedDomain: string | null | undefined): string {
  return storedDomain || OLD_DOMAIN;
}
