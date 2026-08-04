import FormField from './FormField';

export default function EarbudForm({ action, brands, defaults = {}, lockId = false, submitLabel = 'Enregistrer' }) {
  return (
    <form action={action} className="max-w-xl flex flex-col gap-4">
      {!lockId ? (
        <FormField
          label="Identifiant (slug)"
          name="id"
          placeholder="ex. airpods-pro-3"
          hint="Utilisé dans l'URL /ecouteurs/... Laisser vide pour le générer automatiquement. Non modifiable ensuite."
        />
      ) : (
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Identifiant (slug)</span>
          <input
            value={defaults.id}
            disabled
            className="bg-panel border border-line rounded-lg px-3 py-2.5 text-dim"
          />
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5 text-sm">
          <span className="text-dim text-xs">Marque</span>
          <select
            name="brand_id"
            defaultValue={defaults.brand_id || ''}
            required
            className="bg-panel2 border border-line rounded-lg px-3 py-2.5 outline-none focus:border-accent"
          >
            <option value="" disabled>
              Choisir...
            </option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>
        <FormField
          label="Gamme"
          name="gamme"
          placeholder="ex. AirPods Pro"
          defaultValue={defaults.gamme}
          hint="Les modèles d'une même gamme sont comparés entre eux (« ADN de la gamme »)."
          required
        />
      </div>

      <FormField label="Nom" name="name" placeholder="ex. AirPods Pro 3" defaultValue={defaults.name} required />
      <FormField
        label="Accroche"
        name="tagline"
        placeholder="Une phrase courte"
        defaultValue={defaults.tagline}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <FormField
          label="Date de sortie"
          name="release_date"
          type="date"
          defaultValue={defaults.release_date}
          required
        />
        <FormField
          label="Prix au lancement ($)"
          name="price"
          type="number"
          step="1"
          defaultValue={defaults.price ?? ''}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Autonomie écouteur (h)"
          name="battery_bud_h"
          type="number"
          step="0.1"
          defaultValue={defaults.battery_bud_h}
          required
        />
        <FormField
          label="Autonomie totale (h)"
          name="battery_case_h"
          type="number"
          step="0.1"
          defaultValue={defaults.battery_case_h}
          required
        />
        <FormField
          label="Poids / écouteur (g)"
          name="weight_g"
          type="number"
          step="0.01"
          defaultValue={defaults.weight_g}
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField
          label="Certification eau"
          name="water_rating"
          placeholder="ex. IPX4"
          defaultValue={defaults.water_rating}
          required
        />
        <FormField label="Puce" name="chip" placeholder="ex. Apple H2" defaultValue={defaults.chip} />
        <FormField label="Bluetooth" name="bluetooth" placeholder="ex. 5.3" defaultValue={defaults.bluetooth} required />
      </div>

      <div className="flex gap-6 py-1">
        <label className="flex items-center gap-2 text-sm text-dim">
          <input type="checkbox" name="anc" defaultChecked={defaults.anc} className="accent-accent" />
          Réduction de bruit active
        </label>
        <label className="flex items-center gap-2 text-sm text-dim">
          <input type="checkbox" name="marquant" defaultChecked={defaults.marquant} className="accent-accent" />
          Modèle marquant
        </label>
      </div>

      <button type="submit" className="bg-accent text-ink font-semibold rounded-lg px-4 py-2.5 text-sm mt-2 self-start">
        {submitLabel}
      </button>
    </form>
  );
}
