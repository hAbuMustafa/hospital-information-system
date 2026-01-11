<script lang="ts">
  import { page } from '$app/state';
  import Nav from '$lib/components/Nav/Nav.svelte';
  import { toast, Toaster } from 'svelte-sonner';
  import './styles.css';
  const { data, children } = $props();

  $effect(() => {
    if (page.error?.message) {
      toast.error(page.error.message);
    }

    if (page.form?.message) {
      if (page.form.success) {
        toast.success(page.form.message);
      } else {
        toast.error(page.form.message);
      }
    }

    if (page.form?.messages) {
      page.form.messages.forEach((message: string | ToastT) => {
        if (typeof message === 'string') {
          toast.warning(message);
        } else {
          toast[message.type](message.message);
        }
      });
    }

    if (page.data?.message) {
      if (page.data.success) {
        toast.success(page.data.message);
      } else {
        toast.error(page.data.message);
      }
    }

    if (page.data?.messages) {
      page.data.messages.forEach((message: string | ToastT) => {
        if (typeof message === 'string') {
          toast.warning(message);
        } else {
          toast[message.type](message.message);
        }
      });
    }

    if (data.user?.password_reset_required) {
      toast.warning('يلزم تغيير كلمة السر إذا كان هذا أول استخدام لك للمنصة', {
        duration: 10000,
      });
    }

    if (
      data.user &&
      !data.user?.password_reset_required &&
      (!data.user?.email || !data.user?.phone_number || !data.user?.id_doc_number)
    ) {
      toast.warning('يلزم استكمال بيانات الحساب', {
        duration: 10000,
      });
    }
  });
</script>

<svelte:head>
  <title>
    {page.data.title ? `${page.data.title} | ` : ''}مستشفى 23 يوليو للأمراض الصدرية
  </title>
</svelte:head>

<Nav user={data.user} />

<Toaster richColors closeButton position="bottom-left" />

<div class="main-wrapper">
  <h1>
    {page.data.title ?? 'NO TITLE'}
  </h1>

  <main>
    {@render children()}
  </main>
</div>

<style>
  .main-wrapper {
    display: grid;
    grid-template-columns: 1fr 80vw 1fr;
    grid-template-rows: min-content 1fr;

    @media (max-width: 400px) {
      grid-template-columns: 1fr;
    }

    @media print {
      grid-template-columns: 1rem 1fr 1rem;
    }
  }

  h1 {
    text-align: center;
    grid-column: 1 / -1;
  }

  main {
    grid-column: 2 / 3;
    display: grid;
    grid-template-columns: 1fr;
    place-content: center;
    padding-inline: 15%;

    @media (max-width: 700px) {
      grid-column: 1 / -1;
    }
  }
</style>
