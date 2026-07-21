import Foundation
import Capacitor
import CoreHaptics

@objc(PitchIQHapticsPlugin)
public class PitchIQHapticsPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "PitchIQHapticsPlugin"
    public let jsName = "PitchIQHaptics"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "isAvailable", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "start", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "test", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stop", returnType: CAPPluginReturnPromise)
    ]

    private var engine: CHHapticEngine?
    private var player: CHHapticAdvancedPatternPlayer?

    public override func load() {
        guard CHHapticEngine.capabilitiesForHardware().supportsHaptics else { return }
        do {
            engine = try CHHapticEngine()
            engine?.stoppedHandler = { [weak self] _ in self?.player = nil }
            engine?.resetHandler = { [weak self] in try? self?.engine?.start() }
            try engine?.start()
        } catch {
            engine = nil
        }
    }

    @objc func isAvailable(_ call: CAPPluginCall) {
        call.resolve(["available": CHHapticEngine.capabilitiesForHardware().supportsHaptics])
    }

    @objc func start(_ call: CAPPluginCall) {
        guard let engine, CHHapticEngine.capabilitiesForHardware().supportsHaptics else {
            call.reject("Core Haptics is unavailable on this device")
            return
        }

        let mode = call.getString("mode") ?? "calm"
        let intensity = min(max(Float(call.getDouble("intensity") ?? 0.6), 0.05), 1.0)
        let sharpness = min(max(Float(call.getDouble("sharpness") ?? 0.35), 0.0), 1.0)

        do {
            try player?.stop(atTime: CHHapticTimeImmediate)
            let pattern = try makePattern(mode: mode, intensity: intensity, sharpness: sharpness)
            player = try engine.makeAdvancedPlayer(with: pattern)
            player?.loopEnabled = true
            try player?.start(atTime: CHHapticTimeImmediate)
            call.resolve()
        } catch {
            call.reject("Unable to start haptic pattern", nil, error)
        }
    }

    @objc func test(_ call: CAPPluginCall) {
        guard let engine else {
            call.reject("Core Haptics is unavailable on this device")
            return
        }
        let intensity = min(max(Float(call.getDouble("intensity") ?? 0.6), 0.05), 1.0)
        do {
            let event = CHHapticEvent(
                eventType: .hapticContinuous,
                parameters: [
                    CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
                    CHHapticEventParameter(parameterID: .hapticSharpness, value: 0.3)
                ],
                relativeTime: 0,
                duration: 1.5
            )
            let pattern = try CHHapticPattern(events: [event], parameters: [])
            let testPlayer = try engine.makePlayer(with: pattern)
            try testPlayer.start(atTime: CHHapticTimeImmediate)
            call.resolve()
        } catch {
            call.reject("Unable to play test haptic", nil, error)
        }
    }

    @objc func stop(_ call: CAPPluginCall) {
        do {
            try player?.stop(atTime: CHHapticTimeImmediate)
            player = nil
            call.resolve()
        } catch {
            call.reject("Unable to stop haptics", nil, error)
        }
    }

    private func makePattern(mode: String, intensity: Float, sharpness: Float) throws -> CHHapticPattern {
        let pulseDuration: TimeInterval
        let gap: TimeInterval

        switch mode {
        case "focus": pulseDuration = 0.12; gap = 0.18
        case "reset": pulseDuration = 0.09; gap = 0.11
        case "recover": pulseDuration = 0.24; gap = 1.26
        default: pulseDuration = 0.18; gap = 0.82
        }

        let event = CHHapticEvent(
            eventType: .hapticContinuous,
            parameters: [
                CHHapticEventParameter(parameterID: .hapticIntensity, value: intensity),
                CHHapticEventParameter(parameterID: .hapticSharpness, value: sharpness)
            ],
            relativeTime: 0,
            duration: pulseDuration
        )
        let pattern = try CHHapticPattern(events: [event], parameters: [])
        // The advanced player loops the pattern. A parameter curve is unnecessary for this feasibility pass.
        _ = gap
        return pattern
    }
}
