// Unit conversion utilities
// Each group defines compatible units and their conversion factors to a base unit

export const unitGroups: Record<string, { base: string; units: Record<string, number> }> = {
  weight: {
    base: 'kg',
    units: {
      mg: 0.000001,
      g: 0.001,
      kg: 1,
      lb: 0.453592,
      oz: 0.0283495,
    },
  },
  volume: {
    base: 'L',
    units: {
      ml: 0.001,
      L: 1,
      gal: 3.78541,
      qt: 0.946353,
      cup: 0.236588,
      floz: 0.0295735,
    },
  },
  length: {
    base: 'cm',
    units: {
      mm: 0.1,
      cm: 1,
      m: 100,
      in: 2.54,
      ft: 30.48,
    },
  },
  count: {
    base: 'pcs',
    units: {
      pcs: 1,
      pack: 1,
      box: 1,
      pouch: 1,
      block: 1,
      bunch: 1,
      dozen: 12,
    },
  },
};

// Get all available units
export const getAllUnits = (): string[] => {
  const units = new Set<string>();
  Object.values(unitGroups).forEach((group) => {
    Object.keys(group.units).forEach((u) => units.add(u));
  });
  // Add common restaurant units not in groups
  ['pouches', 'blocks', 'bunches', 'packs', 'bottles', 'cans', 'plates', 'bowls'].forEach((u) => units.add(u));
  return Array.from(units).sort();
};

// Convert quantity from one unit to another within the same group
export function convertUnit(
  quantity: number,
  fromUnit: string,
  toUnit: string,
): number {
  if (fromUnit === toUnit) return quantity;

  // Find which group contains both units
  for (const group of Object.values(unitGroups)) {
    const fromFactor = group.units[fromUnit];
    const toFactor = group.units[toUnit];
    if (fromFactor !== undefined && toFactor !== undefined) {
      // Convert to base then to target
      const baseQuantity = quantity * fromFactor;
      return baseQuantity / toFactor;
    }
  }

  // Units not in same group or not found — return as-is
  return quantity;
}

// Check if two units are compatible (same group)
export function areUnitsCompatible(unit1: string, unit2: string): boolean {
  if (unit1 === unit2) return true;
  for (const group of Object.values(unitGroups)) {
    if (group.units[unit1] !== undefined && group.units[unit2] !== undefined) {
      return true;
    }
  }
  return false;
}

// Get the group name for a unit
export function getUnitGroup(unit: string): string | null {
  for (const [name, group] of Object.entries(unitGroups)) {
    if (group.units[unit] !== undefined) return name;
  }
  return null;
}

// Get all units in the same group as the given unit
export function getCompatibleUnits(unit: string): string[] {
  for (const group of Object.values(unitGroups)) {
    if (group.units[unit] !== undefined) {
      return Object.keys(group.units);
    }
  }
  return [unit];
}

// Format a quantity with its unit
export function formatQuantity(quantity: number, unit: string): string {
  const rounded = Math.round(quantity * 100) / 100;
  return `${rounded} ${unit}`;
}
