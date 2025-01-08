import {defineAttackActivity} from "./attack.js";

Hooks.once("init", () => {
  CONFIG.DND5E.activityTypes.attack = { documentClass: defineAttackActivity(CONFIG.DND5E.activityTypes.attack.documentClass) };
});