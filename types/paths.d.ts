type Path = string;
export declare const absolutePath: (to: Path, base: Path) => Path;
export declare const relativePath: (base: Path | undefined, path: Path) => Path;
export declare const sanitizeSearch: (search: string) => string;
export {};
