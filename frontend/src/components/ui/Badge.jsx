const STATUS_STYLES = {
  en_attente:     'bg-yellow-100 text-yellow-800',
  en_preparation: 'bg-blue-100 text-blue-800',
  pret:           'bg-green-100 text-green-800',
  livre:          'bg-gray-100 text-gray-800',
  annule:         'bg-red-100 text-red-800',
}

const STATUS_LABELS = {
  en_attente:     'En attente',
  en_preparation: 'En préparation',
  pret:           'Prêt',
  livre:          'Livré',
  annule:         'Annulé',
}

export function StatusBadge({ statut }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[statut] ?? 'bg-gray-100 text-gray-700'}`}>
      {STATUS_LABELS[statut] ?? statut}
    </span>
  )
}
