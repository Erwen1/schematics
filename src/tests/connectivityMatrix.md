# Connectivity Test Matrix (30 Cases)

This matrix defines the deterministic scenarios that must pass to guarantee `CORE_ENGINE_STABLE`.

## 1. Wire-to-Wire Connections (Basic Graph)
- [C01] Straight segment (2 points)
- [C02] L-junction (2 segments meeting at 90°)
- [C03] T-junction with junction dot (3 segments)
- [C04] T-junction without junction dot (MUST NOT connect)
- [C05] X-crossing with junction dot (4 segments)
- [C06] X-crossing without junction dot (MUST NOT connect)
- [C07] Overlapping collinear wires (Merge into single net)
- [C08] Wire ending exactly on another wire's endpoint

## 2. Component Pin Connections
- [C09] Pin on wire endpoint
- [C10] Pin on wire segment midpoint (MUST NOT connect without junction/endpoint)
- [C11] Multiple pins on same wire net
- [C12] Moving a symbol updates pin positions and net connectivity
- [C13] Rotating a symbol (90, 180, 270) preserves net assignments

## 3. Net Labels & Naming
- [C14] Net label on wire segment
- [C15] Two wires with same label (Global connection)
- [C16] Label on wire vs. Label on Pin
- [C17] Case sensitivity of labels (Default: Case-sensitive)

## 4. Graph Operations (Stability)
- [C18] Delete middle wire segment (Split net)
- [C19] Undo delete wire (Merge net)
- [C20] Move wire vertex (Rubber-banding check)
- [C21] Redo move symbol
- [C22] Duplicate symbol (New ID, but same connected net logic)

## 5. Hierarchical & Complex
- [C23] Port to Net connection
- [C24] Power symbol (VCC/GND) auto-netting
- [C25] Multiple junctions on one node
- [C26] Zero-length wire (Ignore or warn)
- [C27] Wire loop (Cycle detection)
- [C28] Net across multiple schematic sheets
- [C29] Maximum connectivity stress (100+ wires meeting)
- [C30] Re-serialization (Save/Load) bit-identical connectivity hash
