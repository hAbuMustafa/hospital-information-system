<script lang="ts">
  import { enhance } from '$app/forms';
  import {
    arabicTriadicNamesPattern,
    egyptianMobileNumberPattern,
    nationalIdPattern,
    usernamePattern,
  } from '$lib/stores/patterns';

  let { data } = $props();
</script>

<div class="form-wrapper">
  <form method="POST" action="?/username" use:enhance>
    <label for="username">اسم المستخدم</label>
    <input
      type="text"
      id="username"
      name="username"
      value={data.user?.username}
      pattern={usernamePattern.source}
    />
    <input type="submit" value="تعديل" />
  </form>

  <form method="POST" action="?/name" use:enhance>
    <label for="name">اسم الموظف</label>
    <input
      type="text"
      id="name"
      name="name"
      value={data.user?.name}
      pattern={arabicTriadicNamesPattern.source}
    />
    <input type="submit" value="تعديل" />
  </form>

  <form method="POST" action="?/phone_number" use:enhance>
    <label for="phone_number">رقم الموبايل</label>
    <input
      type="text"
      id="phone_number"
      name="phone_number"
      value={data.user?.phone_number}
      pattern={egyptianMobileNumberPattern.source}
    />
    <input type="submit" value="تعديل" />
  </form>

  <form method="POST" action="?/email" use:enhance>
    <label for="email">البريد الإلكتروني</label>
    <input type="email" id="email" name="email" value={data.user?.email} />
    <input type="submit" value="تعديل" />
  </form>

  <form method="POST" action="?/national_id" use:enhance>
    <label for="national_id">الرقم القومي</label>
    <input
      type="text"
      id="national_id"
      name="national_id"
      value={data.user?.national_id}
      pattern={nationalIdPattern.source}
    />
    <input type="submit" value="تعديل" />
  </form>

  <hr />

  <a class="button" href="/account/change-password">تغيير كلمة السر</a>
  <a class="button danger" href="/logout-everywhere">تسجيل خروج من جميع الأجهزة</a>
</div>

<style>
  .form-wrapper {
    border: var(--main-border);
    border-radius: 0.25rem;

    padding: 1rem;

    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
  }

  form {
    display: grid;
    gap: 1rem;
    justify-content: center;
    align-items: center;
    grid-template-columns: 2fr 6fr 1fr;
  }

  label {
    text-align: end;
    text-wrap: nowrap;
  }

  hr {
    width: 100%;
  }

  a.button {
    width: 60%;
  }

  input[type='submit'] {
    padding: 0.25rem;
    font-size: 1rem;
  }
</style>
