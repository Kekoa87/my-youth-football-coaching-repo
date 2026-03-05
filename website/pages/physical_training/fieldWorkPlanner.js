(function () {
  const STORAGE_KEY = 'fieldWorkPlannerData';
  const LEGACY_STORAGE_KEYS = ['coachesCornerPracticePlan', 'practicePlanData'];
  function createWarmupSegment() {
    return {
      id: crypto.randomUUID(),
      durationMinutes: 10,
      name: 'Warm-Ups',
      coachingPoints: '',
      positionGroup: 'All',
      drill: null
    };
  }

  function createDefaultPractice() {
    return {
      workoutFocus: '',
      day: 'Tuesday',
      date: '',
      durationMinutes: 90,
      segments: [createWarmupSegment()]
    };
  }

  const elements = {};
  let state = loadState();
  let activePracticeIndex = 0;

  function init() {
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
    elements.workoutFocus = document.getElementById('workout-focus');
    elements.scheduledTime = document.getElementById('scheduled-time');
    elements.segmentForm = document.getElementById('segment-form');
    elements.segmentId = document.getElementById('segment-id');
    elements.segmentDuration = document.getElementById('segment-duration');
    elements.segmentName = document.getElementById('segment-name');
    elements.segmentGroup = document.getElementById('segment-group');
    elements.segmentPoints = document.getElementById('segment-points');
    elements.drillSide = document.getElementById('drill-side');
    elements.drillPosition = document.getElementById('drill-position');
    elements.drillTitle = document.getElementById('drill-title');
    elements.segmentSubmit = document.getElementById('segment-submit');
    elements.segmentCancel = document.getElementById('segment-cancel');
    elements.segmentDurationValidation = document.getElementById('segment-duration-validation');
    elements.segmentsList = document.getElementById('segments-list');
    elements.resetWeek = document.getElementById('reset-week');
    elements.printWorkout = document.getElementById('print-workout');
  }

  function initializeDrillSelectors() {
    elements.drillSide.innerHTML = '<option value="">No drill selected</option>';

    const library = window.DRILL_LIBRARY || {};
    Object.keys(library).forEach((side) => {
      const option = document.createElement('option');
      option.value = side;
      option.textContent = toDisplayLabel(side);
      option.title = toDisplayLabel(side);
      elements.drillSide.append(option);
    });

    resetPositionDropdown('Select side first');
    resetDrillDropdown('Select position first');
    updateSelectTitle(elements.drillSide);
  }

  function bindEvents() {
    elements.workoutFocus.addEventListener('change', (event) => {
      currentPractice().workoutFocus = event.target.value;
      persistState();
    });

    elements.segmentDuration.addEventListener('input', updateSegmentSubmitState);

    elements.drillSide.addEventListener('change', onDrillSideChange);
    elements.drillPosition.addEventListener('change', onDrillPositionChange);
    elements.drillTitle.addEventListener('change', onDrillTitleChange);

    elements.segmentForm.addEventListener('submit', onSubmitSegment);
    elements.segmentCancel.addEventListener('click', resetSegmentForm);

    elements.segmentsList.addEventListener('click', (event) => {
      if (event.target.closest('.segment-item__drill-link')) {
        event.stopPropagation();
        return;
      }

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

    elements.printWorkout.addEventListener('click', () => {
      window.print();
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

  function updateSegmentSubmitState() {
    const hasDuration = Number.parseInt(elements.segmentDuration.value, 10) > 0;
    elements.segmentSubmit.disabled = !hasDuration;
    elements.segmentDurationValidation.classList.toggle('hidden', hasDuration);
  }

  function onDrillSideChange() {
    const side = elements.drillSide.value;
    updateSelectTitle(elements.drillSide);

    // Always clear dependent selects before repopulating.
    resetPositionDropdown('Select side first');
    resetDrillDropdown('Select position first');

    if (!side) {
      return;
    }

    const positions = window.DRILL_LIBRARY?.[side];
    if (!positions || typeof positions !== 'object') {
      return;
    }

    const positionFragment = document.createDocumentFragment();
    Object.keys(positions).forEach((positionKey) => {
      const option = document.createElement('option');
      option.value = positionKey;
      option.textContent = positions[positionKey].label;
      option.title = positions[positionKey].label;
      positionFragment.append(option);
    });

    elements.drillPosition.append(positionFragment);
    elements.drillPosition.disabled = false;
    elements.drillTitle.disabled = true;
    updateSelectTitle(elements.drillPosition);
    updateSelectTitle(elements.drillTitle);
  }

  function onDrillPositionChange() {
    const side = elements.drillSide.value;
    updateSelectTitle(elements.drillPosition);
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
      option.title = drill.title;
      elements.drillTitle.append(option);
    });

    elements.drillTitle.disabled = false;
    updateSelectTitle(elements.drillTitle);
  }

  function onDrillTitleChange() {
    updateSelectTitle(elements.drillTitle);
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
      durationMinutes: parseInt(elements.segmentDuration.value, 10),
      name: elements.segmentName.value.trim(),
      coachingPoints: elements.segmentPoints.value.trim(),
      positionGroup: elements.segmentGroup.value.trim(),
      drill: getSelectedDrill()
    };

    if (!segment.durationMinutes || !segment.name) {
      updateSegmentSubmitState();
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
    elements.segmentDuration.value = segment.durationMinutes;
    elements.segmentName.value = segment.name;
    elements.segmentGroup.value = segment.positionGroup;
    elements.segmentPoints.value = segment.coachingPoints;
    setDrillSelectors(segment.drill || null);
    elements.segmentSubmit.textContent = 'Save Segment';
    elements.segmentCancel.classList.remove('hidden');
    updateSegmentSubmitState();
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
    elements.workoutFocus.value = practice.workoutFocus || '';
    resetSegmentForm();
    renderSummary();
    renderTimeline();
  }

  function renderSummary() {
    const practice = currentPractice();
    const scheduled = getScheduledMinutes(practice.segments);
    elements.scheduledTime.textContent = String(scheduled);
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
        const linkedName = escapeHtml(segment.name);
        const drillMeta = segment.drill
          ? `<p class="segment-item__meta"><strong>Drill:</strong> <a class="segment-item__drill-link" href="${escapeAttribute(segment.drill.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(segment.drill.title)}</a></p>`
          : '';

        return `
          <li class="segment-item">
            <h4 class="segment-item__title">${linkedName}</h4>
            <p class="segment-item__meta"><strong>Duration:</strong> ${segment.durationMinutes} min</p>
            ${drillMeta}
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
    setDrillSelectors(null);
    elements.segmentSubmit.textContent = 'Add Segment';
    elements.segmentCancel.classList.add('hidden');
    updateSegmentSubmitState();
  }

  function resetPositionDropdown(placeholderText) {
    elements.drillPosition.innerHTML = `<option value="" title="${escapeAttribute(placeholderText)}">${placeholderText}</option>`;
    elements.drillPosition.disabled = true;
    updateSelectTitle(elements.drillPosition);
  }

  function resetDrillDropdown(placeholderText) {
    elements.drillTitle.innerHTML = `<option value="" title="${escapeAttribute(placeholderText)}">${placeholderText}</option>`;
    elements.drillTitle.disabled = true;
    updateSelectTitle(elements.drillTitle);
  }

  function updateSelectTitle(selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    selectElement.title = selectedOption ? selectedOption.textContent : '';
  }

  function migrateLegacyStorage() {
    const currentValue = window.localStorage.getItem(STORAGE_KEY);
    if (currentValue) {
      return currentValue;
    }

    for (const legacyKey of LEGACY_STORAGE_KEYS) {
      const legacyValue = window.localStorage.getItem(legacyKey);
      if (legacyValue) {
        window.localStorage.setItem(STORAGE_KEY, legacyValue);
        window.localStorage.removeItem(legacyKey);
        return legacyValue;
      }
    }

    return null;
  }

  function loadState() {
    const saved = migrateLegacyStorage() || window.localStorage.getItem(STORAGE_KEY);
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
    const segments = Array.isArray(practice.segments) ? practice.segments.map((segment) => normalizeSegment(segment)) : [];
    const normalizedSegments = segments.length ? segments : [createWarmupSegment()];

    return {
      day: practice.day || 'Tuesday',
      date: practice.date || '',
      durationMinutes: Number(practice.durationMinutes) || 90,
      workoutFocus: practice.workoutFocus || '',
      segments: normalizedSegments
    };
  }

  function normalizeSegment(segment) {
    const normalizedDrill = normalizeDrill(segment);

    return {
      id: segment.id || crypto.randomUUID(),
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
