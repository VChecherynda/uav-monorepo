import { useMutation } from '@tanstack/react-query';
import { assignMission } from '../api/assignMission';

export const useAssignMission = () => {
  return useMutation({
    mutationFn: ({ id, droneId }: { id: string; droneId: string }) =>
      assignMission(id, droneId),
  });
};
