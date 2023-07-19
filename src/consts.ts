import type { MeteoDataType, GroupDataType } from "./types";

export const DATA_BASE_NAME = 'testDataBase'
export const DATA_BASE_VERSION = 1

export const STORE_NAMES: Record<Uppercase<MeteoDataType>, MeteoDataType> = {
  TEMPERATURE: "temperature",
  PRECIPITATION: "precipitation",
} as const;

export const ALLOWED_STORE_NAMES_LIST: Readonly<MeteoDataType[]> = [STORE_NAMES.TEMPERATURE, STORE_NAMES.PRECIPITATION] as const

export const SEARCH_YEARS: Record<string, number>  = {
  FROM: 1881,
  TO: 2006
} as const

export const GROUP_DATA_TYPES: Record<Uppercase<GroupDataType>, GroupDataType>  = {
  MONTH: 'month',
  YEAR: 'year'
} as const

export const MAIN_THREAD_CHUNK_SIZE = 1000 as const