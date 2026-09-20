/**
 * Create in-app notifications when a case is filed or its review/outcome changes.
 */

function caseHref(documentId?: string) {
  return documentId ? `/my-case/${documentId}` : '/my-cases';
}

function caseLabel(result: { caseNumber?: string }) {
  return String(result.caseNumber || '').trim() || 'your case';
}

function notificationService() {
  return (
    globalThis as unknown as {
      strapi?: {
        service: (uid: string) => {
          notify: (input: Record<string, unknown>) => Promise<unknown>;
        };
      };
    }
  ).strapi?.service('api::notification.notification');
}

export default {
  async afterCreate(event: {
    result?: {
      user?: string;
      caseNumber?: string;
      documentId?: string;
    };
  }) {
    const result = event.result;
    const user = String(result?.user || '').trim();
    if (!user) return;

    const label = caseLabel(result || {});
    await notificationService()?.notify({
      user,
      title: 'Case registered',
      body: `Case ${label} has been filed.`,
      type: 'case',
      href: caseHref(result?.documentId),
      caseDocumentId: result?.documentId,
    });
  },

  async afterUpdate(event: {
    params?: { data?: Record<string, unknown> };
    result?: {
      user?: string;
      caseNumber?: string;
      documentId?: string;
    };
  }) {
    const result = event.result;
    const user = String(result?.user || '').trim();
    const data = event.params?.data || {};
    if (!user) return;

    const label = caseLabel(result || {});
    const href = caseHref(result?.documentId);
    const service = notificationService();
    if (!service) return;

    if (data.outcome != null && String(data.outcome).trim()) {
      await service.notify({
        user,
        title: 'Final judgement',
        body: `Final judgement is available for case ${label}.`,
        type: 'judgment',
        href,
        caseDocumentId: result?.documentId,
      });
      return;
    }

    if (data.reviewStatus != null && String(data.reviewStatus).trim()) {
      await service.notify({
        user,
        title: 'Review update',
        body: `Review status for case ${label} is now ${String(data.reviewStatus).trim()}.`,
        type: 'review',
        href,
        caseDocumentId: result?.documentId,
      });
    }
  },
};
