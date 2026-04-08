// src/hooks/useProject.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { projectAPI } from '../services/api';
import toast from 'react-hot-toast';

export function useProject(id) {
  const qc = useQueryClient();

  const query = useQuery(
    ['project', id],
    () => projectAPI.getById(id).then(r => r.data),
    { enabled: !!id }
  );

  const approveMilestone = useMutation(
    (milestoneId) => projectAPI.approveMilestone(id, milestoneId),
    {
      onSuccess: () => { toast.success('Etapa aprovada!'); qc.invalidateQueries(['project', id]); },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro ao aprovar'),
    }
  );

  const rejectMilestone = useMutation(
    ({ milestoneId, reason }) => projectAPI.rejectMilestone(id, milestoneId, reason),
    {
      onSuccess: () => { toast.success('Revisão solicitada!'); qc.invalidateQueries(['project', id]); },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro'),
    }
  );

  const addUpdate = useMutation(
    (payload) => projectAPI.addUpdate(id, payload),
    {
      onSuccess: () => { toast.success('Atualização enviada!'); qc.invalidateQueries(['project', id]); },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro'),
    }
  );

  const cancelProject = useMutation(
    (reason) => projectAPI.cancel(id, reason),
    {
      onSuccess: () => { toast.success('Projeto cancelado.'); qc.invalidateQueries(['project', id]); },
      onError: (err) => toast.error(err.response?.data?.error || 'Erro'),
    }
  );

  return { ...query, approveMilestone, rejectMilestone, addUpdate, cancelProject };
}

// src/hooks/useProposal.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { proposalAPI } from '../services/api';

export function useProposals(params = {}) {
  return useQuery(
    ['proposals', params],
    () => proposalAPI.getAll(params).then(r => r.data),
    { keepPreviousData: true }
  );
}

export function useProposalByLink(link) {
  return useQuery(
    ['proposal-link', link],
    () => proposalAPI.getByLink(link).then(r => r.data),
    { enabled: !!link, retry: false }
  );
}

// src/hooks/useNotifications.js
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { notificationAPI } from '../services/api';
import { useNotificationStore } from '../store/index';

export function useNotifications() {
  const qc = useQueryClient();
  const { setNotifications, markRead, markAllRead } = useNotificationStore();

  const query = useQuery('notifications', () =>
    notificationAPI.getAll().then(r => {
      setNotifications(r.data.notifications || []);
      return r.data;
    })
  );

  const markOneMutation = useMutation(
    (id) => notificationAPI.markRead(id),
    { onSuccess: (_, id) => { markRead(id); qc.invalidateQueries('notifications'); } }
  );

  const markAllMutation = useMutation(
    () => notificationAPI.markAllRead(),
    { onSuccess: () => { markAllRead(); qc.invalidateQueries('notifications'); } }
  );

  return { ...query, markOne: markOneMutation.mutate, markAll: markAllMutation.mutate };
}
