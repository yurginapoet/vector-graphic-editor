<template>
  <aside class="panel" aria-label="Inspector">
    <!-- Позиция и размеры -->
    <section class="group">
      <h3 class="groupTitle">Позиция и размеры</h3>


      <!-- Расположение: 2 поля -->
      <div class="fieldBlock">
        <div class="fieldLabel">Расположение</div>
        <div class="grid2">
          <div class="fieldStub" aria-label="X" />
          <div class="fieldStub" aria-label="Y" />
        </div>
      </div>


      <!-- Размер: 2 поля -->
      <div class="fieldBlock">
        <div class="fieldLabel">Размер</div>
        <div class="grid2">
          <div class="fieldStub" aria-label="Width" />
          <div class="fieldStub" aria-label="Height" />
        </div>
      </div>
    </section>

    <!-- Поворот: 1 поле -->
      <div class="fieldBlock">
  <div class="fieldLabel">Поворот</div>
  <div class="grid2">
    <div class="fieldStub" aria-label="Rotation" />
    <div class="spacer" aria-hidden="true" />
  </div>
</div>

    <div class="divider" />

    <!-- Фигура -->
    <section class="group">
      <h3 class="groupTitle">Фигура</h3>

      <div class="grid2Blocks">
        <div class="fieldBlock">
          <div class="fieldLabel">Цвет</div>
          <div class="grid1">
            <div class="fieldStub" aria-label="Fill color" />
          </div>
        </div>

        <div class="fieldBlock">
          <div class="fieldLabel">Прозрачность</div>
          <div class="grid1">
            <div class="fieldStub" aria-label="Fill opacity" />
          </div>
        </div>
      </div>
    </section>

    <div class="divider" />

    <!-- Обводка -->
    <section class="group">
      <h3 class="groupTitle">Обводка</h3>

      <div class="grid2Blocks">
        <div class="fieldBlock">
          <div class="fieldLabel">Цвет</div>
          <div class="grid1">
            <div class="fieldStub" aria-label="Stroke color" />
          </div>
        </div>

        <div class="fieldBlock">
          <div class="fieldLabel">Прозрачность</div>
          <div class="grid1">
            <div class="fieldStub" aria-label="Stroke opacity" />
          </div>
        </div>
      </div>

      <div class="fieldBlock">
  <div class="fieldLabel">Толщина</div>
  <div class="grid2">
    <div class="fieldStub" aria-label="Stroke width" />
    <div class="spacer" aria-hidden="true" />
  </div>
</div>
    </section>


    <div class="divider" />

        <section class="group">
  <h3 class="groupTitle">Слои</h3>

  <ul class="layersList" role="listbox" aria-label="Layers">
    <li>
      <button class="layerItem" type="button">
        <span class="thumb" aria-hidden="true">T</span>
        <span class="layerName">Пиупиу</span>
      </button>
    </li>

    <li>
      <button class="layerItem" type="button">
        <span class="thumb" aria-hidden="true">▭</span>
        <span class="layerName">Прямоугольник</span>
      </button>
    </li>
  </ul>
</section>

  </aside>
</template>

<style scoped>
.panel {
  width: 240px;     
  max-width: 240px;
  min-width: 240px; 
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);

  padding: 12px;

  max-height: 55vh;         
  overflow: auto;           
}

.panel {
  scrollbar-gutter: stable;
}

.groupTitle {
  font-weight: 800;
  font-size: 16px;
  margin: 0 0 4px;
  color: #111827;
}

.group {
  display: grid;
  gap: 6px;
}

.divider {
  height: 1px;
  background: #e5e7eb;
  margin: 8px 0;
}

.fieldBlock {
  display: grid;
  gap: 4px;
}

.fieldLabel {
  font-size: 12px;
  color: #374151;
}

.grid1 {
  display: grid;
  grid-template-columns: 1fr;
}

.grid2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;        
}

.grid2Blocks {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.fieldStub {
  height: 16px;
  border-radius: 8px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
}


.layersRow {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.iconBtn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  cursor: pointer;
}

.iconBtn:hover {
  background: #f3f4f6;
}

.spacer {
  height: 20px;      
}



.layersList {
  list-style: none;
  padding: 0;
  margin: 0;

  display: grid;
  gap: 6px;
}

.layerItem {
  width: 100%;
  display: grid;
  grid-template-columns: 20px 1fr;
  align-items: center;
  gap: 10px;

  padding: 6px 8px;
  border-radius: 10px;

  background: #ffffff;
  border: 1px solid transparent;
  cursor: pointer;

  text-align: left;
  color: #111827;
}

.layerItem:hover {
  background: #f3f4f6;
}

.layerItem:focus {
  outline: none;
}

.layerItem:focus-visible {
  outline: 2px solid rgba(37, 99, 235, 0.55);
  outline-offset: 2px;
  border-radius: 10px;
}

.layerItem.isActive {
  background: rgba(37, 99, 235, 0.12);
  border-color: rgba(37, 99, 235, 0.30);
}

.thumb {
  width: 20px;
  height: 20px;
  border-radius: 6px;

  display: grid;
  place-items: center;

  background: #ffffff;
  border: 1px solid #e5e7eb;

  font-size: 12px;
  font-weight: 700;
  color: #374151;

  user-select: none;
}

.layerName {
  font-size: 12px;
  font-weight: 500;
  color: #111827;

  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

</style>