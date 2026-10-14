Picvium.Raw.dll: LibRaw 0.22.2 with Picvium ABI1 bridge (LGPL-2.1).
Copyright 2008-2025 LibRaw LLC; bridge Copyright 2026 deuxdoom.
LibRaw is dual-licensed (LGPL-2.1 or CDDL-1.0); Picvium distributes it under LGPL-2.1 (LGPL-2.1.txt).
Copyright notice: LibRaw-COPYRIGHT.txt. X3F decoder (X3FTOOLS): X3F-LICENSE.txt.
LibRaw source: https://github.com/LibRaw/LibRaw/tree/0.22.2
Source archive: https://codeload.github.com/LibRaw/LibRaw/zip/refs/tags/0.22.2
Source archive SHA256: 02275a04cf0d1477ab9fd7ee231ddea59e7b14497458da6e3ba957517d6655c7
The upstream sources are unchanged; the new RawBridge.cpp implements ABI1.
Bridge source: https://github.com/deuxdoom/PICVIUM/blob/main/licenses/raw/source/RawBridge.cpp
Bridge SHA256: b9df37341da545f5aaaf04a13ddab856dbb36e1f550968c827426ac1cfe18ece
This library can be modified and replaced independently of the proprietary application.
It must remain a separate lib/Picvium.Raw.dll, outside a single-file bundle.

Rebuild using Zig 0.15.2 (https://ziglang.org/download/) or a compatible C++ compiler.
1. Download the source archive above and check its SHA256.
2. Extract it; this creates the folder LibRaw-0.22.2.
3. Download RawBridge.cpp from the bridge source link and place it next to that folder.
4. Change into LibRaw-0.22.2 and compile the src/**/*.cpp files,
excluding *_ph.cpp (alternative placeholders), together with ../RawBridge.cpp:
zig c++ -target x86_64-windows-gnu -std=c++11 -O2 -shared -D_USE_MATH_DEFINES
  -DLIBRAW_WIN32_DLLDEFS -DLIBRAW_BUILDLIB -DUSE_X3FTOOLS -DLIBRAW_CALLOC_RAWSTORE
  -DLIBRAW_X3F_ALLOC_LIMIT_MB=512 -I . <source files> ../RawBridge.cpp
  -lws2_32 -o Picvium.Raw.dll
Combine the above lines into one command; <source files> is the enumerated list.
The managed app checks ABI1 and the X3F capability. No native paths are hardcoded.
RawBridge.cpp is LGPL-2.1-only, as noted in its source header.
The compiler itself is not included; the runtime libraries it links are covered in licenses/zig-runtime/.
