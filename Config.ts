export interface IDictionaryLookupSource {
	priority: number;
	name: string;
	source: string;
}

export interface ILanguageConfig {
	key: string;
	title: string;
	default: boolean;
	lookupSources: Array<IDictionaryLookupSource>;
}

export interface IConfig {
	languageConfigs: Array<ILanguageConfig>;
}
