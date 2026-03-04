(function () {
  const STORAGE_KEY = 'coachesCornerPracticePlan';
  const DEFAULT_PRACTICE_START_TIME = '16:30';

  function createWarmupSegment(startTime) {
    return {
      id: crypto.randomUUID(),
      startTime,
      durationMinutes: 10,
      name: 'Warm-Ups',
      coachingPoints: '',
      positionGroup: 'All',
      drill: null
    };
  }

  function createDefaultPractice() {
    return {
      day: 'Tuesday',
      date: '',
      durationMinutes: 90,
      startTime: DEFAULT_PRACTICE_START_TIME,
      segments: [createWarmupSegment(DEFAULT_PRACTICE_START_TIME)]
    };
  }

  const elements = {};
  let state = loadState();
  let activePracticeIndex = 0;

  function init() {
    window.coachAuth.guard('/coaches-login.html');
    hydrateSharedLayout();
    cacheElements();
    initializeDrillSelectors();
    bindEvents();
    render();
  }

  function hydrateSharedLayout() {
    fetch('/website/includes/header.html')
      .then((r) => r.text())
      .then((html) => {
        document.getElementById('site-header').innerHTML = html;
      });

    fetch('/website/includes/footer.html')
      .then((r) => r.text())
      .then((html) => {
        document.getElementById('site-footer').innerHTML = html;
      });
  }

  function cacheElements() {
    elements.weekLabel = document.getElementById('week-label');
    elements.practiceDay = document.getElementById('practice-day');
    elements.practiceDate = document.getElementById('practice-date');
    elements.practiceDuration = document.getElementById('practice-duration');
    elements.practiceStartTime = document.getElementById('practice-start-time');
    elements.scheduledTime = document.getElementById('scheduled-time');
    elements.remainingTime = document.getElementById('remaining-time');
    elements.durationWarning = document.getElementById('duration-warning');
    elements.segmentForm = document.getElementById('segment-form');
    elements.segmentId = document.getElementById('segment-id');
    elements.segmentStart = document.getElementById('segment-start');
    elements.segmentDuration = document.getElementById('segment-duration');
    elements.segmentName = document.getElementById('segment-name');
    elements.segmentGroup = document.getElementById('segment-group');
    elements.segmentPoints = document.getElementById('segment-points');
    elements.drillSide = document.getElementById('drill-side');
    elements.drillPosition = document.getElementById('drill-position');
    elements.drillTitle = document.getElementById('drill-title');
    elements.segmentSubmit = document.getElementById('segment-submit');
    elements.segmentCancel = document.getElementById('segment-cancel');
    elements.segmentsList = document.getElementById('segments-list');
    elements.logout = document.getElementById('coach-logout');
    elements.resetWeek = document.getElementById('reset-week');
  }

  function initializeDrillSelectors() {
    elements.drillSide.innerHTML = '<option value="">No drill selected</option>';
    Object.keys(window.DRILL_LIBRARY).forEach((side) => {
      const option = document.createElement('option');
      option.value = side;
      option.textContent = toDisplayLabel(side);
      elements.drillSide.append(option);
    });

    resetPositionDropdown('Select side first');
    resetDrillDropdown('Select position first');
  }

  function bindEvents() {
    elements.weekLabel.addEventListener('input', (event) => {
      state.week = event.target.value || 'Week 1';
      persistState();
    });

    elements.practiceDay.addEventListener('input', (event) => {
      currentPractice().day = event.target.value;
      persistState();
    });

    elements.practiceDate.addEventListener('input', (event) => {
      currentPractice().date = event.target.value;
      persistState();
    });

    elements.practiceDuration.addEventListener('input', (event) => {
      const duration = parseInt(event.target.value, 10);
      currentPractice().durationMinutes = Number.isFinite(duration) ? Math.max(duration, 1) : 1;
      persistState();
      renderSummary();
    });

    elements.practiceStartTime.addEventListener('input', (event) => {
      const startTime = event.target.value || DEFAULT_PRACTICE_START_TIME;
      currentPractice().startTime = startTime;

      const firstSegment = currentPractice().segments[0];
      if (firstSegment && firstSegment.name === 'Warm-Ups' && firstSegment.startTime === elements.segmentStart.value) {
        firstSegment.startTime = startTime;
      }

      if (!elements.segmentId.value) {
        elements.segmentStart.value = startTime;
      }

      persistState();
      renderTimeline();
    });

    elements.drillSide.addEventListener('change', onDrillSideChange);
    elements.drillPosition.addEventListener('change', onDrillPositionChange);
    elements.drillTitle.addEventListener('change', onDrillTitleChange);

    elements.segmentForm.addEventListener('submit', onSubmitSegment);
    elements.segmentCancel.addEventListener('click', resetSegmentForm);

    elements.segmentsList.addEventListener('click', (event) => {
      const action = event.target.dataset.action;
      const segmentId = event.target.dataset.segmentId;
      if (!action || !segmentId) {
        return;
      }

      if (action === 'edit') {
        startSegmentEdit(segmentId);
      }

      if (action === 'delete') {
        deleteSegment(segmentId);
      }

      if (action === 'move-up' || action === 'move-down') {
        reorderSegment(segmentId, action === 'move-up' ? -1 : 1);
      }
    });

    elements.logout.addEventListener('click', (event) => {
      event.preventDefault();
      window.coachAuth.logout();
      window.location.replace('/index.html');
    });

    elements.resetWeek.addEventListener('click', () => {
      state = {
        week: 'Week 1',
        practices: [createDefaultPractice()]
      };
      persistState();
      resetSegmentForm();
      render();
    });
  }

  function onDrillSideChange() {
    const side = elements.drillSide.value;
    resetPositionDropdown('Select position');
    resetDrillDropdown('Select drill');

    if (!side) {
      resetPositionDropdown('Select side first');
      resetDrillDropdown('Select position first');
      return;
    }

    const positions = window.DRILL_LIBRARY[side];
    Object.keys(positions).forEach((positionKey) => {
      const option = document.createElement('option');
      option.value = positionKey;
      option.textContent = positions[positionKey].label;
      elements.drillPosition.append(option);
    });

    elements.drillPosition.disabled = false;
    elements.drillTitle.disabled = true;
  }

  function onDrillPositionChange() {
    const side = elements.drillSide.value;
    const position = elements.drillPosition.value;
    resetDrillDropdown('Select drill');

    if (!side || !position) {
      elements.drillTitle.disabled = true;
      return;
    }

    const drillList = window.DRILL_LIBRARY[side][position].drills;
    drillList.forEach((drill, index) => {
      const option = document.createElement('option');
      option.value = String(index);
      option.textContent = drill.title;
      elements.drillTitle.append(option);
    });

    elements.drillTitle.disabled = false;
  }

  function onDrillTitleChange() {
    const selectedDrill = getSelectedDrill();
    if (selectedDrill) {
      // Selecting a drill auto-fills drill/activity name; coaches can still edit manually after.
      elements.segmentName.value = selectedDrill.title;
    }
  }

  function onSubmitSegment(event) {
    event.preventDefault();

    const segment = {
      id: elements.segmentId.value || crypto.randomUUID(),
      startTime: elements.segmentStart.value,
      durationMinutes: parseInt(elements.segmentDuration.value, 10),
      name: elements.segmentName.value.trim(),
      coachingPoints: elements.segmentPoints.value.trim(),
      positionGroup: elements.segmentGroup.value.trim(),
      drill: getSelectedDrill()
    };

    if (!segment.startTime || !segment.durationMinutes || !segment.name) {
      return;
    }

    const practice = currentPractice();
    const existingIndex = practice.segments.findIndex((item) => item.id === segment.id);

    if (existingIndex >= 0) {
      practice.segments[existingIndex] = segment;
    } else {
      practice.segments.push(segment);
    }

    persistState();
    resetSegmentForm();
    renderTimeline();
    renderSummary();
  }

  function getSelectedDrill() {
    const side = elements.drillSide.value;
    const position = elements.drillPosition.value;
    const drillIndex = elements.drillTitle.value;

    if (!side || !position || drillIndex === '') {
      return null;
    }

    const drill = window.DRILL_LIBRARY?.[side]?.[position]?.drills?.[Number(drillIndex)];
    if (!drill) {
      return null;
    }

    return {
      side,
      position,
      title: drill.title,
      url: drill.url
    };
  }

  function setDrillSelectors(drill) {
    if (!drill) {
      elements.drillSide.value = '';
      onDrillSideChange();
      return;
    }

    elements.drillSide.value = drill.side || '';
    onDrillSideChange();

    elements.drillPosition.value = drill.position || '';
    onDrillPositionChange();

    const drillList = window.DRILL_LIBRARY?.[drill.side]?.[drill.position]?.drills || [];
    const drillIndex = drillList.findIndex((item) => item.url === drill.url && item.title === drill.title);
    elements.drillTitle.value = drillIndex >= 0 ? String(drillIndex) : '';
  }

  function startSegmentEdit(segmentId) {
    const segment = currentPractice().segments.find((item) => item.id === segmentId);
    if (!segment) {
      return;
    }

    elements.segmentId.value = segment.id;
    elements.segmentStart.value = segment.startTime;
    elements.segmentDuration.value = segment.durationMinutes;
    elements.segmentName.value = segment.name;
    elements.segmentGroup.value = segment.positionGroup;
    elements.segmentPoints.value = segment.coachingPoints;
    setDrillSelectors(segment.drill || null);
    elements.segmentSubmit.textContent = 'Save Segment';
    elements.segmentCancel.classList.remove('hidden');
    elements.segmentName.focus();
  }

  function deleteSegment(segmentId) {
    const practice = currentPractice();
    practice.segments = practice.segments.filter((item) => item.id !== segmentId);
    persistState();
    renderTimeline();
    renderSummary();
    resetSegmentForm();
  }

  function reorderSegment(segmentId, direction) {
    const practice = currentPractice();
    const index = practice.segments.findIndex((item) => item.id === segmentId);
    const newIndex = index + direction;

    if (index < 0 || newIndex < 0 || newIndex >= practice.segments.length) {
      return;
    }

    const segmentToMove = practice.segments[index];
    practice.segments.splice(index, 1);
    practice.segments.splice(newIndex, 0, segmentToMove);
    persistState();
    renderTimeline();
  }

  function render() {
    const practice = currentPractice();
    elements.weekLabel.value = state.week;
    elements.practiceDay.value = practice.day || '';
    elements.practiceDate.value = practice.date || '';
    elements.practiceDuration.value = practice.durationMinutes || 90;
    elements.practiceStartTime.value = practice.startTime || DEFAULT_PRACTICE_START_TIME;
    resetSegmentForm();
    renderSummary();
    renderTimeline();
  }

  function renderSummary() {
    const practice = currentPractice();
    const scheduled = getScheduledMinutes(practice.segments);
    const duration = Number(practice.durationMinutes) || 0;

    elements.scheduledTime.textContent = String(scheduled);
    elements.remainingTime.textContent = String(duration - scheduled);
    elements.durationWarning.classList.toggle('hidden', scheduled <= duration);
  }

  function renderTimeline() {
    const practice = currentPractice();

    if (!practice.segments.length) {
      elements.segmentsList.innerHTML = '<li class="segment-item"><p class="segment-item__meta">No segments yet. Add your first drill block above.</p></li>';
      return;
    }

    elements.segmentsList.innerHTML = practice.segments
      .map((segment, index) => {
        const safeGroup = segment.positionGroup ? `<p class="segment-item__meta"><strong>Group:</strong> ${escapeHtml(segment.positionGroup)}</p>` : '';
        const linkedName = segment.drill
          ? `<a class="segment-item__title-link" href="${escapeAttribute(segment.drill.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(segment.name)}</a>`
          : escapeHtml(segment.name);

        return `
          <li class="segment-item">
            <h4 class="segment-item__title">${linkedName}</h4>
            <p class="segment-item__meta"><strong>${escapeHtml(segment.startTime)}</strong> · ${segment.durationMinutes} min</p>
            ${safeGroup}
            <p class="segment-item__meta"><strong>Coaching Points:</strong> ${escapeHtml(segment.coachingPoints || '—')}</p>
            <div class="segment-actions">
              <button type="button" class="btn btn-outline" data-action="move-up" data-segment-id="${segment.id}" ${index === 0 ? 'disabled' : ''}>Up</button>
              <button type="button" class="btn btn-outline" data-action="move-down" data-segment-id="${segment.id}" ${index === practice.segments.length - 1 ? 'disabled' : ''}>Down</button>
              <button type="button" class="btn btn-outline" data-action="edit" data-segment-id="${segment.id}">Edit</button>
              <button type="button" class="btn btn-outline" data-action="delete" data-segment-id="${segment.id}">Delete</button>
            </div>
          </li>
        `;
      })
      .join('');
  }

  function resetSegmentForm() {
    elements.segmentForm.reset();
    elements.segmentId.value = '';
    elements.segmentStart.value = currentPractice().startTime || DEFAULT_PRACTICE_START_TIME;
    setDrillSelectors(null);
    elements.segmentSubmit.textContent = 'Add Segment';
    elements.segmentCancel.classList.add('hidden');
  }

  function resetPositionDropdown(placeholderText) {
    elements.drillPosition.innerHTML = `<option value="">${placeholderText}</option>`;
    elements.drillPosition.disabled = true;
  }

  function resetDrillDropdown(placeholderText) {
    elements.drillTitle.innerHTML = `<option value="">${placeholderText}</option>`;
    elements.drillTitle.disabled = true;
  }

  function loadState() {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return {
        week: 'Week 1',
        practices: [createDefaultPractice()]
      };
    }

    try {
      const parsed = JSON.parse(saved);
      if (!parsed.week || !Array.isArray(parsed.practices) || !parsed.practices[0]) {
        return {
          week: 'Week 1',
          practices: [createDefaultPractice()]
        };
      }
      return normalizeState(parsed);
    } catch (error) {
      return {
        week: 'Week 1',
        practices: [createDefaultPractice()]
      };
    }
  }

  function normalizeState(rawState) {
    return {
      week: rawState.week || 'Week 1',
      practices: rawState.practices.map((practice) => normalizePractice(practice))
    };
  }

  function normalizePractice(practice) {
    const startTime = practice.startTime || DEFAULT_PRACTICE_START_TIME;
    const segments = Array.isArray(practice.segments) ? practice.segments.map((segment) => normalizeSegment(segment)) : [];
    const normalizedSegments = segments.length ? segments : [createWarmupSegment(startTime)];

    return {
      day: practice.day || 'Tuesday',
      date: practice.date || '',
      durationMinutes: Number(practice.durationMinutes) || 90,
      startTime,
      segments: normalizedSegments
    };
  }

  function normalizeSegment(segment) {
    const normalizedDrill = normalizeDrill(segment);

    return {
      id: segment.id || crypto.randomUUID(),
      startTime: segment.startTime || DEFAULT_PRACTICE_START_TIME,
      durationMinutes: Number(segment.durationMinutes) || 10,
      name: segment.name || 'Segment',
      coachingPoints: segment.coachingPoints || '',
      positionGroup: segment.positionGroup || '',
      drill: normalizedDrill
    };
  }

  function normalizeDrill(segment) {
    if (segment.drill && segment.drill.url && segment.drill.title) {
      return {
        side: segment.drill.side || '',
        position: segment.drill.position || '',
        title: segment.drill.title,
        url: segment.drill.url
      };
    }

    if (segment.drillLink) {
      return {
        side: '',
        position: '',
        title: segment.name || 'Linked Drill',
        url: segment.drillLink
      };
    }

    return null;
  }

  function persistState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function currentPractice() {
    return state.practices[activePracticeIndex];
  }

  function getScheduledMinutes(segments) {
    return segments.reduce((total, segment) => total + (Number(segment.durationMinutes) || 0), 0);
  }

  function toDisplayLabel(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value).replaceAll('`', '&#096;');
  }

  document.addEventListener('DOMContentLoaded', init);
})();
