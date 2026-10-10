(function () {
  const S = window.SITE || {};
  const has = (v) => typeof v === 'string' && v.trim() !== '';
  const TODO = '준비 중이에요';

  // 사실 채우기: 비어 있으면 "준비 중"
  document.querySelectorAll('[data-fact]').forEach((el) => {
    const v = S[el.dataset.fact];
    el.textContent = has(v) ? v : TODO;
    el.classList.toggle('todo', !has(v));
  });
  document.querySelectorAll('[data-fact-small]').forEach((el) => {
    const v = S[el.dataset.factSmall];
    if (has(v)) el.textContent = '주차: ' + v; else el.remove();
  });
  document.querySelectorAll('[data-fact-line]').forEach((el) => {
    const v = S[el.dataset.factLine];
    if (has(v)) el.textContent = v; else el.remove();
  });

  // 바깥 연결: 주소가 있을 때만 보인다
  document.querySelectorAll('[data-link]').forEach((el) => {
    const v = S[el.dataset.link];
    if (has(v)) { el.href = v; el.hidden = false; }
  });

  // 사진: 없으면 자리 표시
  const gallery = document.getElementById('gallery');
  const photos = Array.isArray(S.photos) ? S.photos.filter((p) => p && has(p.src)) : [];
  if (photos.length) {
    photos.forEach((p) => {
      const f = document.createElement('figure');
      const img = document.createElement('img');
      img.src = p.src; img.alt = p.alt || '새싹 공방 수업 사진'; img.loading = 'lazy';
      f.appendChild(img); gallery.appendChild(f);
    });
  } else {
    for (let i = 0; i < 3; i++) {
      const f = document.createElement('figure');
      f.className = 'empty';
      f.textContent = '수업 사진을 곧 올릴게요';
      gallery.appendChild(f);
    }
  }

  // 후기: 실제 후기가 있을 때만
  const reviews = Array.isArray(S.reviews) ? S.reviews.filter((r) => r && has(r.text)) : [];
  if (reviews.length) {
    const list = document.getElementById('review-list');
    reviews.forEach((r) => {
      const li = document.createElement('li');
      const p = document.createElement('p'); p.textContent = r.text;
      li.appendChild(p);
      if (has(r.who)) { const s = document.createElement('span'); s.textContent = r.who; li.appendChild(s); }
      list.appendChild(li);
    });
    document.getElementById('reviews').hidden = false;
  }

  // 블로그·유튜브
  if (/^[\w-]{11}$/.test(S.youtubeVideoId || '')) {
    const v = document.getElementById('video');
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube-nocookie.com/embed/' + S.youtubeVideoId;
    f.title = '새싹 공방 수업 영상';
    f.loading = 'lazy';
    f.allow = 'accelerometer; encrypted-media; gyroscope; picture-in-picture';
    f.allowFullscreen = true;
    v.appendChild(f); v.hidden = false;
  }
  if (has(S.blog) || has(S.youtube) || /^[\w-]{11}$/.test(S.youtubeVideoId || '')) {
    document.getElementById('more').hidden = false;
  }

  // 예약 신청 폼
  const form = document.getElementById('book-form');
  const msg = document.getElementById('form-msg');
  const dateInput = form.elements.wish_date;
  const d = new Date();
  dateInput.min = new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.className = 'form-msg'; msg.textContent = '';
    const f = form.elements;
    if (!f.name.value.trim() || !f.contact.value.trim()) { msg.className = 'form-msg err'; msg.textContent = '이름과 연락처를 적어 주세요.'; return; }
    if (!f.wish_date.value) { msg.className = 'form-msg err'; msg.textContent = '희망 날짜를 골라 주세요.'; f.wish_date.focus(); return; }
    if (!f.consent.checked) { msg.className = 'form-msg err'; msg.textContent = '개인정보 수집·이용에 동의해 주세요.'; return; }

    const btn = form.querySelector('button[type=submit]');
    btn.disabled = true; btn.textContent = '보내는 중…';
    try {
      const r = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: f.name.value, contact: f.contact.value, wish_date: f.wish_date.value,
          website: f.website.value, consent: f.consent.checked,
        }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || '보내지 못했어요. 잠시 뒤 다시 시도해 주세요.');
      form.reset();
      msg.className = 'form-msg ok';
      msg.textContent = '예약 신청이 접수됐어요. 확인 후 연락드릴게요.';
    } catch (err) {
      msg.className = 'form-msg err';
      msg.textContent = err.message;
    } finally {
      btn.disabled = false; btn.textContent = '예약 신청하기';
    }
  });
})();

(function () {
  const top = document.querySelector('.top');
  const dock = document.querySelector('.dock');
  const onScroll = () => {
    top.classList.toggle('scrolled', window.scrollY > 40);
    dock.classList.toggle('on', window.scrollY > window.innerHeight * 0.6);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
