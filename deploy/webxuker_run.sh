#!/bin/bash
cd /opt/webxuker
node services/webxuker/webxuker.js --cfg=../webxuker-configs/config.json | bunyan >> logs/webxuker_$(date +"%Y%m%d").log 2>&1
