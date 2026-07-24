export const integratedKey = "pitchiq_integrated_v1";

export function returningPlayerState() {
  return {
    version: 1,
    data: {
      profile: {
        name: "Test Player",
        number: "10",
        position: "Winger",
        style: "Creator",
        avatar: "default",
        goal: "React faster",
        createdAt: 1,
      },
      firstRun: {
        version: 1,
        status: "complete",
        currentStep: "complete",
        completedSteps: [
          "landing", "name", "number", "position", "know-your-strengths",
          "academy-induction", "meet-your-coach", "meet-the-camera", "practice",
          "player-contract", "avatar", "player-style",
        ],
        completedAt: "2026-01-01T00:00:00.000Z",
      },
      game: {
        xp: 0, level: 1, streak: 1, coins: 0, dailyDone: false,
        packOpened: false, unlocked: [], lastXp: 0, bestCombo: 0,
        trainingSeconds: 0, lastResult: null,
      },
      analytics: {
        sessions: [], bestReaction: null, reactionHistory: [],
        weeklyXp: [0, 0, 0, 0, 0, 0, 0],
      },
      settings: {
        sound: true, haptics: true, reduceMotion: false,
        highContrast: false, cameraPreference: "environment",
      },
      notifications: {
        preferences: {
          trainingEnabled: false, trainingTime: "18:00", trainingDays: [1, 2, 3, 4, 5],
          rewardAlerts: true, levelUpAlerts: true, streakAlerts: true,
          permissionStatus: "default",
        },
        items: [],
        rewardSnapshot: { level: 1, unlocked: [] },
        trainingSnapshot: {
          sessionIds: [], bestAccuracy: 0, bestCombo: 0,
          bestScore: 0, weeklyXpMilestones: [],
        },
      },
    },
  };
}

export async function clearPitchIQState(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.__pitchiqBrowserErrors = [];
    window.addEventListener("error", event => window.__pitchiqBrowserErrors.push(String(event.error || event.message)));
    window.addEventListener("unhandledrejection", event => window.__pitchiqBrowserErrors.push(String(event.reason)));
  });
}

export async function seedReturningPlayer(page) {
  const state = returningPlayerState();
  await page.addInitScript(({ key, value }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(key, JSON.stringify(value));
    localStorage.setItem("pitchiqPlayerServiceMigrationV1", "true");
  }, { key: integratedKey, value: state });
}
