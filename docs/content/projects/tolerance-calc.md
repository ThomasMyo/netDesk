---
title: Tolerance stack-up calculator
category: code
year: 2024
summary: Python tool for worst-case and RSS stack-ups from a CSV of dimensions.
link: https://github.com/ThomasMyo
tools: [Python, NumPy]
order: 4
---

A small command-line tool that reads a CSV of dimensions and tolerances and reports
worst-case and RSS stack-ups.

```python
rss = math.sqrt(sum(t**2 for t in tolerances))
```
