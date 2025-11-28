export const defineAttackSheet = (baseClass) => {
  return class FollowupAttackSheet extends baseClass {
    static PARTS = {
      ...super.PARTS,
      effect: {
        template: "modules/dnd5e-follow-up-save/templates/attack-effect.hbs",
        templates: [
          ...super.PARTS.effect.templates,
          "modules/dnd5e-follow-up-save/templates/attack-follow-up.hbs"
        ]
      }
    }
  
    async _prepareEffectContext(context, options) {
      context = await super._prepareEffectContext(context, options);
      context.followupActivityOptions = this.item.system.activities.getByType("save").map(saveActivity => ({ label: saveActivity.name, value: saveActivity.id }));
      context.followupActivityOptions.unshift({ label: "DND5E.None", value: "" });
      return context;
    }
  };
};
