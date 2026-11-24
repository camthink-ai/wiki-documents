---
id: ek410-display-panel
title: Display Panel Characteristics
sidebar_position: 1
description: EK410 Spectra 6 panel characteristics, six-color codes, native frame format, refresh behavior and image adaptation tips.
keywords: [EK410, Spectra 6, six-color e-paper, frame format, refresh]
tags: [EK410, hardware guide, display]
---

# Display Panel Characteristics

This page describes the 7.09″ E Ink Spectra 6 panel used by the EK410 and the firmware-level frame format conventions, for content production and secondary development.

## Panel Characteristics

| Item | Specification |
| :--- | :--- |
| Technology | E Ink Spectra 6 six-color e-paper |
| Size | 7.09″ |
| Native resolution | 1200 × 1600 (portrait), dual driver ICs left / right |
| Logical resolution | 1600 × 1200 (landscape, the coordinate system used by the firmware) |
| Colors | Black / white / yellow / red / blue / green |
| Interface | Standard SPI with dual chip selects (CS0 / CS1, each driving half the panel) |

## Six-Color Codes

The frame buffer uses 4bpp — 2 pixels per byte (high nibble first). Color codes:

| Color | Code (low nibble) |
| :--- | :--- |
| Black | `0` |
| White | `1` |
| Yellow | `2` |
| Red | `3` |
| Blue | `5` |
| Green | `6` |

A full-white fill is therefore `0x11`; any byte is a combination of two codes from the table.

## Native Frame Format

`uploadFrame` / `lastFrame` share the same layout:

- Total **960000 bytes** (1600 × 1200 × 0.5 bytes).
- The physical panel is 1200×1600 portrait with dual ICs (CS0 / CS1); firmware applies a **90° rotation and half-panel split** before write.
- Organize data as logical **1600×1200 landscape, row-major, 4bpp**. For hand-built frames use `tools/frame_convert.py` (real CS0/CS1 layout) — do not assume a pure landscape buffer maps 1:1 onto the panel.

## Refresh Behavior

- **Full refresh**: every content update is a full-panel refresh, about 20–40 seconds; it runs asynchronously on the display task and concurrent requests return `render busy`.
- **Image retention**: the panel keeps the image with no power after refreshing; static display consumes nothing.
- **Event-driven**: there is no continuous refresh or partial "playback"; the update rate is decided by the content source (web operation, URL refresh, scheduled wake, MQTT command).
- Snapshot: every successful user refresh writes the native frame to the `lastfrm` partition for Web console preview and API reads.

## Image Adaptation Tips

- Compose full-screen images at **1600 × 1200** landscape; other aspect ratios are cropped or letterboxed per the chosen fit mode.
- Let the Web console's Floyd–Steinberg dithering handle photos and gradients — avoid manual posterization.
- Prefer the editor mode for text and thin lines (vector compositing is sharper than scaled bitmaps).
- Device-side fetching supports **baseline** JPEG / PNG / native frames only; progressive JPEG fails; convert WebP on the platform beforehand. Size and redirect limits: [Displaying content](../2-user-guide/1-display-content.md).

## Related Pages

- [Displaying Content](../2-user-guide/1-display-content.md): content workflows and quantization.
- [Specifications and Interfaces](./0-specifications.md): full specifications and partition table.
- [HTTP API Reference](../4-software-guide/1-http-api.md): `uploadFrame` and snapshot endpoints.
