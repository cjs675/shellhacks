<script lang="ts">
 import * as Command from "$lib/components/ui/command/index.js";
 import { onMount } from "svelte";
 import * as Resizable from "$lib/components/ui/resizable/index.js";
 let open = $state(false);
 
 function handleKeydown(e: KeyboardEvent) {
  if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
   e.preventDefault();
   open = !open;
  }
 }
</script>
 
<Resizable.PaneGroup direction="vertical">
 <Resizable.Pane>One</Resizable.Pane>
 <Resizable.Handle withHandle />
 <Resizable.Pane>Two</Resizable.Pane>
</Resizable.PaneGroup> 
<svelte:document onkeydown={handleKeydown} />
 
<Command.Dialog bind:open>
 <Command.Input placeholder="Type a command or search..." />
 <Command.List>
  <Command.Empty>No results found.</Command.Empty>
  <Command.Group heading="Suggestions">
   <Command.Item>Calendar</Command.Item>
   <Command.Item>Search Emoji</Command.Item>
   <Command.Item>Calculator</Command.Item>
  </Command.Group> 
  <Command.Group heading = "Inbox">
    <Command.Item>Unread Messages</Command.Item>
    <Command.Item>Trash</Command.Item>
    <Command.Item>New Message</Command.Item>
  </Command.Group>
 </Command.List>
</Command.Dialog>
