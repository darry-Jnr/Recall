export interface PageVisit {
  pageTitle: string;
  url: string;
  metaDescription: string;
  h1: string;
  first500Chars: string;
  timeSpentSec: number;
  domain: string;
  visitedTime: string;
  keywords: string[];
}

export interface GroqSearchRequest {
  query: string;
  candidates: PageVisit[];
}

export interface GroqSearchResult extends PageVisit {
  relevanceScore: number;
  summary: string;
}

export interface GroqSearchResponse {
  results: GroqSearchResult[];
}

export interface ClassifiedPage {
  url: string;
  pageTitle: string;
  domain: string;
  reason: string;
}
