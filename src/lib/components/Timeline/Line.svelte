<script lang="ts">
  const { indefinite = false } = $props();
</script>

<span class="line" class:fading={indefinite}></span>

<style>
  .line {
    width: 2px;
    background: #bdbdbd;
    height: 40px;
    transform: translateX(-1px);
  }

  .line.fading {
    background: linear-gradient(#fff, 30%, transparent 99% 1%);
    height: 80px;
  }
</style>
