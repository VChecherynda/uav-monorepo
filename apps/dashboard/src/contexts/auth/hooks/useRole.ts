import { useMe } from './useMe';

export const useRole = () => {
  const { isLoading, data } = useMe();

  const isCommander = data?.unitRole === 'COMMANDER';

  return {
    isLoading,
    isCommander,
  };
};
