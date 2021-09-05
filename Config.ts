import { UUID } from './UUID';

export interface IDictionaryLookupSource {
	priority: number;
	name: string;
	source: string;
}

export interface ILanguageConfig {
	key: UUID;
	name: string;
	default: boolean;
	lookupSources: Array<IDictionaryLookupSource>;
}

export interface IConfig {
	languageConfigs: Array<ILanguageConfig>;
	activeLanguage: UUID | null;
}
