import {defineAttackSheet} from "./attack-sheet.js";

export const defineAttackActivity = (baseClass) => {
  return class FollowupAttackActivity extends baseClass {
    static defineSchema() {
      const { StringField } = foundry.data.fields;
      const schema = {
        ...super.defineSchema(),
        followupActivityId: new StringField({ name: "followupActivity", initial: "" })
      };
      return schema;
    }
  
    static metadata = foundry.utils.mergeObject(
      foundry.utils.mergeObject({}, super.metadata), {
        sheetClass: defineAttackSheet(dnd5e.applications.activity.AttackSheet),
        usage: {
          actions: {
            rollSave: FollowupAttackActivity.#rollSave,
            rollSaveDamage: FollowupAttackActivity.#rollSaveDamage
          }
        }
      }, 
      { insertKeys: true, insertValues: true }
    );

    _usageChatButtons(message) {
      const buttons = super._usageChatButtons(message);
      if (this.followupActivityId) {
        const saveActivity = this.item.system.activities.get(this.followupActivityId);
        if (!saveActivity) return buttons;
        const saveButtons = saveActivity._usageChatButtons(message)
        const saveDamageButton = saveButtons.find(i => i.dataset?.action === "rollDamage");
        if (saveDamageButton) {
          saveDamageButton.label = game.i18n.localize("DND5E.SAVE.FIELDS.damage.label");
          saveDamageButton.dataset.action = "rollSaveDamage";
        }
        buttons.push(...saveButtons);
      }
      return buttons;
    }

    static #rollSaveDamage(event, target, message) {
      this.rollSaveDamage(event);
    }

    static async #rollSave(event, target, message) {
      const targets = dnd5e.utils.getSceneTargets();
      if ( !targets.length && game.user.character ) targets.push(game.user.character);
      if ( !targets.length ) ui.notifications.warn("DND5E.ActionWarningNoToken", { localize: true });
      const dc = parseInt(target.dataset.dc);
      for ( const token of targets ) {
        const actor = token instanceof Actor ? token : token.actor;
        const speaker = ChatMessage.getSpeaker({ actor, scene: canvas.scene, token: token.document });
        await actor.rollSavingThrow({
          event,
          ability: target.dataset.ability ?? this.save.ability.first(),
          target: Number.isFinite(dc) ? dc : this.save.dc.value
        }, {}, { data: { speaker } });
      }
    }

    rollSaveDamage(event) {
      const saveActivity = this.item.system.activities.get(this.followupActivityId);
      if (!saveActivity) return;
      saveActivity.rollDamage({ event });
    }
  };
};
