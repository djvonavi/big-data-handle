import type { MeteoDataType } from "../types";
import { ALLOWED_STORE_NAMES_LIST } from "../consts";

import DB from "./indexedDbConnector";
import { fetchData } from "../utils";

async function getByYearsFromDB<T>(
  storeName: MeteoDataType,
  from: string,
  to: string
) {
  const data = await DB.getDataByRange<T>(storeName, from, to);
  return data;
}

async function getByYearsFromAPI<T>(
  storeName: MeteoDataType,
  from?: string,
  to?: string
): Promise<T[]> {
  if (!ALLOWED_STORE_NAMES_LIST.includes(storeName)) {
    throw new Error(`Неизвестное имя хранилища: ${storeName}`);
  } else {
    const data = await fetchData<T>(`../data/${storeName}.json`);
    return data;
  }
}

/**
 * Тут происходит условие из ТЗ: 
 * - ищем сперва в базе getByYearsFromDB()
 * - если не находим - идем в API getByYearsFromAPI()
 * - кладем в БД
 * - отдаем
 */
export async function getDataByYears<T>(
  storeName: MeteoDataType,
  fromYear: number,
  toYear: number
): Promise<T[]> {
  try {
    const fromDataString = `${fromYear}-01-01`;
    const toDataString = `${toYear}-12-31`;
    const dataFromDb = await getByYearsFromDB<T>(
      storeName,
      fromDataString,
      toDataString
    );
    if (!dataFromDb.length) {
      const dataFromApi = await getByYearsFromAPI<T>(
        storeName,
        fromDataString,
        toDataString
      );
      await DB.addData<T>(storeName, dataFromApi);

      return await getDataByYears<T>(storeName, fromYear, toYear);
    }
    return dataFromDb;
  } catch (e) {
    console.error(e);
    return [];
  }
}
