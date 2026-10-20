import { createContext } from 'react';
import type { Content, DemoSession } from '../types';

export interface PortfolioState {
  content: Content | null;
  managedContent: Content | null;
  session: DemoSession | null;
  ready: boolean;
  error: string;
  refresh: () => Promise<void>;
}
export const PortfolioContext = createContext<PortfolioState | null>(null);
