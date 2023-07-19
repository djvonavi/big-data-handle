import type { ItemData } from "../types";

export function getAverages(items: ItemData[]): number {
  return Math.ceil(
    items.reduce((acc, item) => {
      return acc + item.v;
    }, 0) / items.length
  );
}

/**
 * Группировка данных по месяцам / годам с вычислением среднего арифметического значения
 * @param allData ItemData[]
 * @param sliceValue - -3, 4
 * @returns ItemData[]
 */

export function groupDataBy(allData: ItemData[], sliceValue: number): ItemData[] {
  const byGroup = new Map<string, ItemData[]>();
  for (let oneDay of allData) {
    const group = oneDay.t.slice(0, sliceValue);
    if (!byGroup.has(group)) {
      byGroup.set(group, []);
    }
    byGroup.get(group)?.push(oneDay);
  }

  const byGroupKeys = Array.from(byGroup.keys()).sort();
  return byGroupKeys.map((groupKey) => {
    const byGroupData = byGroup.get(groupKey) ?? [];
    const averageValue = getAverages(byGroupData);

    return {
      t: groupKey,
      v: averageValue,
    };
  });
}

export function groupDataByMonth(allData: ItemData[]): ItemData[] {
  return groupDataBy(allData, -3)
}

export function groupDataByYear(allData: ItemData[]): ItemData[] {
  return groupDataBy(allData, 4)
}
