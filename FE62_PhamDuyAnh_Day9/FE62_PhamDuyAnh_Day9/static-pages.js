/**
 * JS cho trang Giới thiệu / Trợ giúp / Liên hệ (HTML tĩnh)
 */
(function () {
    function initFaq() {
        document.querySelectorAll('.faq-item .faq-question').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var item = btn.closest('.faq-item');
                if (!item) return;
                var wasOpen = item.classList.contains('is-open');
                document.querySelectorAll('.faq-item.is-open').forEach(function (open) {
                    if (open !== item) open.classList.remove('is-open');
                });
                item.classList.toggle('is-open', !wasOpen);
            });
        });
    }

    function initContactForm() {
        var form = document.getElementById('contactForm');
        var msg = document.getElementById('contactFormMessage');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();
            if (msg) {
                msg.className = 'form-message';
                msg.textContent = '';
            }

            var name = (form.querySelector('[name="name"]') || {}).value;
            var phone = (form.querySelector('[name="phone"]') || {}).value;
            var email = (form.querySelector('[name="email"]') || {}).value;
            var content = (form.querySelector('[name="message"]') || {}).value;

            name = (name || '').trim();
            phone = (phone || '').trim();
            email = (email || '').trim();
            content = (content || '').trim();

            if (!name || !phone || !email || !content) {
                if (msg) {
                    msg.textContent = 'Vui lòng điền đầy đủ các trường bắt buộc.';
                    msg.classList.add('is-error');
                } else {
                    alert('Vui lòng điền đầy đủ các trường bắt buộc.');
                }
                return;
            }

            var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            if (!emailOk) {
                if (msg) {
                    msg.textContent = 'Email không hợp lệ.';
                    msg.classList.add('is-error');
                } else {
                    alert('Email không hợp lệ.');
                }
                return;
            }

            var phoneDigits = phone.replace(/\s/g, '');
            if (!/^[0-9]{9,11}$/.test(phoneDigits)) {
                if (msg) {
                    msg.textContent = 'Số điện thoại không hợp lệ (9–11 chữ số).';
                    msg.classList.add('is-error');
                } else {
                    alert('Số điện thoại không hợp lệ.');
                }
                return;
            }

            console.log('[Liên hệ — demo]', { name: name, phone: phone, email: email, message: content });

            if (msg) {
                msg.textContent = 'Cảm ơn bạn! Chúng tôi đã nhận thông tin và sẽ phản hồi sớm nhất có thể.';
                msg.classList.add('is-success');
            } else {
                alert('Đã gửi thông tin (demo).');
            }
            form.reset();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initFaq();
        initContactForm();
    });
})();
