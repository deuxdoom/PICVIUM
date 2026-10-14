// SPDX-License-Identifier: LGPL-2.1-only
// Copyright (c) 2026 deuxdoom. This bridge is supplied under LGPL-2.1 as part of the replaceable LibRaw library.
// Picvium's stable ABI over LibRaw 0.22.2 (T1-FMT-C3b).
#include "libraw/libraw.h"
#include <cstring>

struct PvRawInfo {
    int width, height, raw_width, raw_height, flip;
    float iso, exposure, aperture, focal_length;
    char make[64], model[64];
};
extern "C" {
DllDef unsigned pvraw_abi() { return 1; }
DllDef void pvraw_configure(libraw_data_t* raw) {
    raw->params.output_bps = 16;
    raw->params.output_color = 1; // sRGB
    raw->params.use_camera_wb = 1;
    raw->params.user_flip = 0; // managed decoder applies the source orientation once
    raw->rawparams.max_raw_memory_mb = 512;
}
DllDef void pvraw_info(libraw_data_t* raw, PvRawInfo* info) {
    std::memset(info, 0, sizeof(*info));
    info->width = raw->sizes.width; info->height = raw->sizes.height;
    info->raw_width = raw->sizes.raw_width; info->raw_height = raw->sizes.raw_height;
    info->flip = raw->sizes.flip;
    info->iso = raw->other.iso_speed; info->exposure = raw->other.shutter;
    info->aperture = raw->other.aperture; info->focal_length = raw->other.focal_len;
    std::memcpy(info->make, raw->idata.make, 63);
    std::memcpy(info->model, raw->idata.model, 63);
}
}
