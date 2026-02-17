/* ──────────────────────────────────────────────
   IoTValidationPlayground — Stress Lab for IoT
   ────────────────────────────────────────────── */

import React, { useState } from 'react';
import SchematicCanvas from '../components/Canvas/SchematicCanvas';
import { useSchematicStore } from '../store/schematicStore';
import { DesignAdvisor } from '../components/DesignAdvisor/DesignAdvisor';
import { generateFromPrompt, injectFaults } from '../engine/aiSchematicEngine';
import './IoTValidationPlayground.css';

const projects = [
    { id: 'sensor-node', name: '1. Basic Sensor Node', prompt: 'Create ESP32 with BME280 I2C sensor, 4.7k pullups and 3.3V power' },
    { id: 'dual-voltage', name: '2. Dual Voltage Node', prompt: 'Create 12V input, MP1584 for 5V, LM1117 for 3.3V, ESP32 and 5V sensor with level shifter' },
    { id: 'spi-expansion', name: '3. SPI Expansion Node', prompt: 'Add ESP32 and 2x MicroSD cards with unique CS pins' },
    { id: 'rs485-node', name: '4. RS485 Industrial Node', prompt: 'Create ESP32 with MAX485, screw terminals and protection diodes' },
    { id: 'ethernet-gateway', name: '5. Ethernet IoT Gateway', prompt: 'Create ESP32 with LAN8720 Ethernet PHY in RMII mode' },
    { id: 'inductive-power', name: '6. Power + Inductive Load', prompt: 'Create MOSFET driving a relay with flyback diode and gate resistor' },
    { id: 'nightmare', name: '7. Test Z (Combined)', prompt: 'Generate Test Z Nightmare system' },
];

const IoTValidationPlayground: React.FC = () => {
    const {
        symbols,
        wires,
        addGeneratedSubsystem,
        runErc,
        ercViolations,
        darkMode,
        newProject,
        recalculateNets
    } = useSchematicStore();

    const [selectedProjectId, setSelectedProjectId] = useState(projects[0].id);
    const [faultInjection, setFaultInjection] = useState(false);
    const [metrics, setMetrics] = useState({
        compCount: 0,
        netCount: 0,
        genTime: 0,
        netTime: 0,
        ercTime: 0,
        score: 0
    });

    const handleGenerate = async () => {
        // Clear project
        newProject();

        const project = projects.find(p => p.id === selectedProjectId);
        if (!project) return;

        const startGen = performance.now();
        const { symbols: genSymbols, wires: genWires } = generateFromPrompt(project.prompt);
        const endGen = performance.now();

        if (faultInjection) {
            injectFaults(genSymbols, genWires);
        }

        // Add to store
        addGeneratedSubsystem(genSymbols, genWires);

        const startNet = performance.now();
        recalculateNets();
        const endNet = performance.now();

        setMetrics({
            compCount: genSymbols.length,
            netCount: useSchematicStore.getState().nets.length,
            genTime: endGen - startGen,
            netTime: endNet - startNet,
            ercTime: metrics.ercTime,
            score: calculateDesignScore(genSymbols.length, ercViolations.length)
        });
    };

    const handleRunValidation = () => {
        const start = performance.now();
        runErc();
        const end = performance.now();
        setMetrics(m => ({
            ...m,
            ercTime: end - start,
            score: calculateDesignScore(symbols.length, ercViolations.length)
        }));
    };

    const calculateDesignScore = (comps: number, violations: number) => {
        if (comps === 0) return 0;
        const base = 100;
        const penalty = violations * 15;
        return Math.max(0, base - penalty);
    };

    const getScoreBadge = (score: number) => {
        if (score >= 90) return { label: 'A+', color: '#10b981' };
        if (score >= 70) return { label: 'B', color: '#f59e0b' };
        if (score >= 50) return { label: 'C', color: '#ef4444' };
        return { label: 'F', color: '#7f1d1d' };
    };

    const badge = getScoreBadge(metrics.score);

    return (
        <div className={`playground-app ${darkMode ? 'dark' : 'light'}`}>
            <div className="playground-header">
                <h1>⚡ AI-First IoT Stress Lab</h1>
                <button
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '4px', cursor: 'pointer' }}
                    onClick={() => window.location.href = '/'}
                >
                    Back to Editor
                </button>
            </div>

            <div className="playground-body">
                {/* Left Panel: Controls */}
                <div className="playground-sidebar sidebar-left">
                    <section className="control-section">
                        <h3>Project Selector</h3>
                        <select
                            value={selectedProjectId}
                            onChange={(e) => setSelectedProjectId(e.target.value)}
                        >
                            {projects.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <button className="btn-primary" onClick={handleGenerate}>🛠 Generate</button>
                    </section>

                    <section className="control-section">
                        <h3>Fault Injection</h3>
                        <div className="toggle-row">
                            <span>Inject Faults</span>
                            <input
                                type="checkbox"
                                checked={faultInjection}
                                onChange={(e) => setFaultInjection(e.target.checked)}
                            />
                        </div>
                        <p className="tiny-text">Automated regression testing for silent hardware bugs.</p>
                    </section>

                    <section className="control-section">
                        <button className="btn-secondary" onClick={handleRunValidation}>⚡ Run Validation</button>
                    </section>
                </div>

                {/* Center: Canvas */}
                <div className="playground-canvas">
                    <SchematicCanvas />
                </div>

                {/* Right Panel: Metrics & Advisor */}
                <div className="playground-sidebar sidebar-right">
                    <section className="metrics-section">
                        <h3>Performance Metrics</h3>
                        <div className="metric-row">
                            <span>Components</span>
                            <span>{metrics.compCount}</span>
                        </div>
                        <div className="metric-row">
                            <span>Nets</span>
                            <span>{metrics.netCount}</span>
                        </div>
                        <div className="metric-row">
                            <span>Generation</span>
                            <span>{metrics.genTime.toFixed(1)}ms</span>
                        </div>
                        <div className="metric-row">
                            <span>Net Compute</span>
                            <span>{metrics.netTime.toFixed(1)}ms</span>
                        </div>
                        <div className="metric-row">
                            <span>ERC Latency</span>
                            <span>{metrics.ercTime.toFixed(1)}ms</span>
                        </div>
                        <div className="design-score">
                            <span>Design Score</span>
                            <div className="score-badge" style={{ backgroundColor: badge.color }}>
                                {badge.label}
                            </div>
                        </div>
                    </section>

                    <section className="advisor-section">
                        <DesignAdvisor />
                    </section>
                </div>
            </div>

            {/* Bottom: Console */}
            <div className="playground-console">
                <div className="console-header">Validation Console</div>
                <div className="console-list">
                    {ercViolations.length === 0 ? (
                        <div className="console-msg success">No ERC errors found. Design is healthy.</div>
                    ) : (
                        ercViolations.map((err, i) => (
                            <div key={i} className={`console-msg ${err.severity}`}>
                                [{err.severity.toUpperCase()}] {err.message}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default IoTValidationPlayground;
