/**
 * Feature-local constants for the tables feature.
 */

/**
 * Sentinel <Select> value representing "no zone" in the add-table dialog.
 * The Base UI Select needs a non-empty string value, so we use this token and
 * translate it back to `undefined` when calling the create handler.
 */
export const NO_ZONE_VALUE = '__no_zone__' as const;

/** Spanish label for tables with no assigned zone. */
export const NO_ZONE_LABEL = 'Sin zona' as const;
