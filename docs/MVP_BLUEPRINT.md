# PitchIQ MVP Blueprint

Version: 1.1  
Status: Locked  
Owner: Product Owner

---

## Vision

PitchIQ is not simply a football training app.

PitchIQ is an Academy experience.

The player should feel as though they have been recruited into a professional academy, earned their place through performance, signed their contract, received their identity, and begun a structured development journey.

Every screen exists to reinforce this experience.

---

## MVP Journey

### 1. Landing Screen

**Objective:** Welcome the player into the academy.  
**Outcome:** Player chooses to enter the academy.

### 2. Player Identity

**Objective:** Create ownership before account creation.

Features:
- Player name
- Jersey preview
- Name appears on jersey

**Outcome:** Player begins identifying with their football identity.

### 3. Choose Position

**Objective:** Select playing position.

Features:
- Interactive pitch
- Position markers
- Position descriptions
- Position selection

**Outcome:** Player chooses where they lead.

### 4. Academy Trial

**Objective:** Complete a baseline football IQ assessment.

Features:
- Short scenario-based questions
- Decision making
- Time pressure
- Immediate feedback

**Outcome:** Scout evaluates the player.

### 5. Scout Report

**Objective:** Reward and validate the player.

Features:
- Academy approval
- Initial Football IQ score
- Position confirmation
- Player strengths summary

**Outcome:** Player feels selected.

### 6. Sign Your Contract

**Objective:** Create an account without breaking immersion.

Registration should feel like signing an academy contract rather than filling out a form.

Features:
- Player signature or username
- Locker-room keycode or password
- Save-progress explanation

**Outcome:** Player secures their academy place.

### 7. Contract Signed

**Objective:** Celebrate commitment.

Features:
- Contract accepted state
- Player ID
- Welcome message

**Outcome:** Player feels officially accepted into the academy.

### 8. Your Academy Player

**Objective:** Reveal the player's identity.

Features:
- Avatar reveal
- Locker-room setting
- Personal player identity

**Outcome:** Player sees themselves as part of the academy.

### 9. Academy Kit

**Objective:** Present club identity.

Features:
- Jersey
- Badge
- Kit presentation

**Outcome:** Player feels they belong to the academy.

### 10. Home and Long-Term Development

**Objective:** Begin an ongoing Football IQ learning pathway.

Features:
- Today's Mission
- Quick Train
- Football IQ modules
- Adaptive Coach Focus
- Curriculum progress
- XP and Academy level
- Benchmarks and development priorities

**Outcome:** Daily engagement and structured development begin.

---

## Football IQ Learning Pathway

The long-term player experience follows this progression:

```text
Mission experience
        ↓
Module mastery
        ↓
Adaptive training plan
        ↓
12-week curriculum phase
        ↓
Football IQ benchmark
        ↓
Academy progression
```

### Current platform status

Completed:
- native Football IQ mission runtime;
- seven module hubs;
- persistent progression and mastery;
- adaptive recommendations;
- curriculum phase tracking;
- assessment benchmarks.

In development:
- expansion from seven initial missions to 21 core missions;
- three missions per module;
- Foundation, Developing and Advanced progression;
- complete coaching and reflection content;
- Academy progression extensions.

The detailed mission contract is governed by [Sprint 22.0](sprints/sprint-22-0-content-framework-lock.md).

---

## MVP Success Criteria

A successful MVP means:

- Players complete the full Academy Journey.
- Players enjoy the academy experience.
- Players understand that Football IQ can be trained.
- Players return to complete training.
- Players understand their progress pathway.
- Each module teaches a distinct football-thinking behaviour.
- Recommendations and benchmarks reflect recorded progress rather than XP alone.

---

## Out of Scope for MVP

The following belong to Beta or Production unless separately approved:

- Coach Portal
- Parent Portal
- Team Features
- Social Features
- Multiplayer
- Wearables
- Cloud Analytics
- normative rankings or percentiles

Experimental computer-vision, LiDAR and sensor capabilities may be explored in the PitchIQ Lab but must not be treated as required MVP dependencies.

---

## Design Principles

Every screen should:

- Build identity.
- Feel rewarding.
- Reinforce academy immersion.
- Have one primary objective.
- Minimise friction.
- Maintain premium quality.
- Make the learning purpose understandable.

No feature should be added if it weakens the Academy Journey or contradicts the locked learning and platform architecture.

---

## Build Rule

The next priority should normally be the next unfinished stage in the approved Academy and curriculum pathway, not a disconnected feature.
