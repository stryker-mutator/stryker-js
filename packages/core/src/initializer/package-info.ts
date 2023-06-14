export interface PackageInfo extends PackageSummary {
  homepage?: string;
  initStrykerConfig?: Record<string, unknown>;
}

export interface PackageSummary {
  name: string;
  keywords: string[];
  version: string;
}
