import {defineAttackActivity} from "./attack.js";

Hooks.once("init", () => {
  // Patch attack activity
  CONFIG.DND5E.activityTypes.attack = { documentClass: defineAttackActivity(CONFIG.DND5E.activityTypes.attack.documentClass) };

  // Register setting to patch save activities' `canUse` to return false if selected as a follow-up
  game.settings.register("dnd5e-follow-up-save", "blockUsage", {
    name: "dnd5e-follow-up-save.BlockUsage.Name",
    hint: "dnd5e-follow-up-save.BlockUsage.Hint",
    scope: "world",
    config: true,
    type: Boolean,
    default: false,
    requiresReload: true
  });

  // If above setting is enabled, patch save activities' `canUse` as described
  if (game.settings.get("dnd5e-follow-up-save", "blockUsage")) {
    const saveClass = CONFIG.DND5E.activityTypes.save.documentClass;
    const origGetter = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(saveClass).prototype, "canUse").get;
    Object.defineProperty(saveClass.prototype, "canUse", {
      get: function() {
        if (!origGetter.call(this)) return false;
        return !this.item?.system.activities?.getByType("attack").some(a => a.followupActivityId === this.id);
      }
    })
  }
});