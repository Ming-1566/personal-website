import { useContext } from 'react';
import { PortfolioContext } from './context';

export function usePortfolio() {
  const value = useContext(PortfolioContext);
  if (!value) throw new Error('页面需要 PortfolioProvider。');
  return value;
}
