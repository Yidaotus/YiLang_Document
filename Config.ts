export interface IDictionaryLookupSource {
	priority: number;
	name: string;
	source: string;
}

export interface ILanguageConfig {
	id: string;
	name: string;
	lookupSources: Array<IDictionaryLookupSource>;
}

export interface IConfig {
	languageConfigs: Array<ILanguageConfig>;
	activeLanguage: string | null;
}
