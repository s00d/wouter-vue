type Path = string;
export declare const absolutePath: (to: Path, base: Path) => Path;
export declare const relativePath: (base: Path, path: Path) => Path;
export declare const sanitizeSearch: (search: string) => string;
export {};
