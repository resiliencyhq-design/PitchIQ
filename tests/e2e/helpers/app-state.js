export const STORAGE_KEYS = Object.freeze({
  canonicalState: "pitchiq_integrated_v1",
  firstRun: "pitchiqFirstRun",
  migration: "pitchiqPlayerServiceMigrationV1",
  name: "pitchiqPlayerName",
  number: "pitchiqJerseyNumber",
  position: "pitchiqSelectedPosition",
  style: "pitchiqPlayerStyle",
  avatar: "pitchiqPlayerAvatar",
  academyAvatar: "pitchiqAcademyAvatar",
  onboardingComplete: "pitchiqOnboardingComplete",
  academyAccepted: "pitchiqAcademyAccepted",
  guardianEmail: "pitchiqGuardianEmail",
  playerContract: "pitchiqPlayerContract",
});

const completedSteps = [
  "landing",
  "name",
  "number",
  "position",
  "know-your-strengths",
  "academy-induction",
  "meet-your-coach",
  "meet-the-camera",
  "practice",
  "player-contract",
  "avatar",
  "player-style",
];

export async function clearAllPitchIQStorage(page) {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
}

export async function establishFirstRun(page) {
  await clearAllPitchIQStorage(page);
}

export async function establishReturningPlayer(page, overrides = {}) {
  const player = {
    name: "Test Player",
    number: "10",
    position: "CAM",
    style: "playmaker",
    avatar: "captain",
    goal: "React faster",
    createdAt: Date.now(),
    ...overrides,
  };

  await page.addInitScript(({ keys, playerValue, steps }) => {
    const firstRun = {
      version: 1,
      status: "complete",
      currentStep: "complete",
      completedSteps: steps,
      completedAt: new Date().toISOString(),
    };
    const state = {
      profile: playerValue,
      game: {
        xp: 0,
        level: 1,
        streak: 1,
        coins: 0,
        dailyDone: false,
        packOpened: false,
        unlocked: [],
        lastXp: 0,
        bestCombo: 0,
        trainingSeconds: 0,
        lastResult: null,
      },
      analytics: {
        sessions: [],
        bestReaction: null,
        reactionHistory: [],
        weeklyXp: [0, 0, 0, 0, 0, 0, 0],
      },
      settings: {
        sound: true,
        haptics: true,
        reduceMotion: false,
        highContrast: false,
        cameraPreference: "environment",
      },
      firstRun,
    };

    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem(keys.canonicalState, JSON.stringify(state));
    localStorage.setItem(keys.firstRun, JSON.stringify(firstRun));
    localStorage.setItem(keys.migration, "true");
    localStorage.setItem(keys.name, playerValue.name);
    localStorage.setItem(keys.number, playerValue.number);
    localStorage.setItem(keys.position, playerValue.position);
    localStorage.setItem(keys.style, playerValue.style);
    localStorage.setItem(keys.avatar, playerValue.avatar);
    localStorage.setItem(keys.academyAvatar, playerValue.avatar);
    localStorage.setItem(keys.onboardingComplete, "true");
    localStorage.setItem(keys.academyAccepted, "true");
    localStorage.setItem(keys.guardianEmail, "guardian@example.com");
    localStorage.setItem(keys.playerContract, JSON.stringify({ accepted: true, version: "2026-07" }));
  }, { keys: STORAGE_KEYS, playerValue: player, steps: completedSteps });
}

export async function readPitchIQStorage(page) {
  return page.evaluate(() => ({
    local: Object.fromEntries(Object.entries(localStorage)),
    session: Object.fromEntries(Object.entries(sessionStorage)),
  }));
}
